from django.conf import settings
from django.db import models

from users.models import Cell
from .seasons import SEASON_CHOICES

SOURCE_FARMER_REPORTED = "farmer_reported"
SOURCE_NISR_IMPORT = "nisr_import"
SOURCE_GOVERNMENT_IMPORT = "government_import"
SOURCE_CHOICES = [
    (SOURCE_FARMER_REPORTED, "Farmer reported"),
    (SOURCE_NISR_IMPORT, "NISR import"),
    (SOURCE_GOVERNMENT_IMPORT, "Other government/institutional import"),
]


# --- Master data, managed by the national superadmin only ---------------

class Crop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    local_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class LivestockType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    local_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Fertilizer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    fertilizer_type = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# --- Farmer-registered land and livestock --------------------------------

class Land(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lands")
    cell = models.ForeignKey(Cell, on_delete=models.PROTECT, related_name="lands")
    # Unique Parcel Identifier. Real integration with the National Land Authority
    # is a future step; for now the farmer deliberately types their own UPI and it
    # is validated unique before the record is allowed to save.
    upi = models.CharField(max_length=50, unique=True)
    hectares = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    planted_crop = models.ForeignKey(Crop, null=True, blank=True, on_delete=models.SET_NULL, related_name="lands")
    season = models.CharField(max_length=1, choices=SEASON_CHOICES, null=True, blank=True)
    season_year = models.PositiveIntegerField(null=True, blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.upi} ({self.owner.full_name})"


class LivestockLocation(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="livestock_locations")
    cell = models.ForeignKey(Cell, on_delete=models.PROTECT, related_name="livestock_locations")
    livestock_type = models.ForeignKey(LivestockType, on_delete=models.PROTECT, related_name="locations")
    count = models.PositiveIntegerField(default=1)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.livestock_type} x{self.count} ({self.owner.full_name})"


# --- Reports feeding the country-wide analytics ---------------------------

class HarvestReport(models.Model):
    land = models.ForeignKey(Land, on_delete=models.CASCADE, related_name="harvest_reports")
    crop = models.ForeignKey(Crop, on_delete=models.PROTECT, related_name="harvest_reports")
    season = models.CharField(max_length=1, choices=SEASON_CHOICES)
    season_year = models.PositiveIntegerField()
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default=SOURCE_FARMER_REPORTED)
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="harvest_reports"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["crop", "season", "season_year"])]

    def __str__(self):
        return f"{self.crop} {self.season}{self.season_year} - {self.quantity_kg}kg"


class LivestockProduction(models.Model):
    livestock_location = models.ForeignKey(LivestockLocation, on_delete=models.CASCADE, related_name="production_reports")
    product_type = models.CharField(max_length=50)  # e.g. milk, meat, eggs
    season = models.CharField(max_length=1, choices=SEASON_CHOICES)
    season_year = models.PositiveIntegerField()
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=20, default="kg")
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default=SOURCE_FARMER_REPORTED)
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="livestock_reports"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["livestock_location", "season", "season_year"])]

    def __str__(self):
        return f"{self.livestock_location.livestock_type} {self.product_type} {self.season}{self.season_year}"

from django.conf import settings
from django.db import models

from users.models import Cell

from ..constants import SOURCE_CHOICES, SOURCE_FARMER_REPORTED
from ..seasons import SEASON_CHOICES
from .catalog import LivestockType


class LivestockLocation(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="livestock_locations")
    cell = models.ForeignKey(Cell, on_delete=models.PROTECT, related_name="livestock_locations")
    livestock_type = models.ForeignKey(LivestockType, on_delete=models.PROTECT, related_name="locations")
    count = models.PositiveIntegerField(default=1)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.livestock_type} x{self.count} ({self.owner.full_name})"


class LivestockProduction(models.Model):
    livestock_location = models.ForeignKey(LivestockLocation, on_delete=models.CASCADE, related_name="production_reports")
    product_type = models.CharField(max_length=50)
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

from django.conf import settings
from django.db import models

from ..constants import SOURCE_CHOICES, SOURCE_FARMER_REPORTED
from ..seasons import SEASON_CHOICES
from .catalog import Crop
from .land import Land


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

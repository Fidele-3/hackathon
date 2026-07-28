from django.conf import settings
from django.db import models

from users.models import Cell

from ..seasons import SEASON_CHOICES
from .catalog import Crop


class Land(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lands")
    cell = models.ForeignKey(Cell, on_delete=models.PROTECT, related_name="lands")
    # Farmer-entered until National Land Authority integration exists; validated
    # unique before save (see production/serializers when built).
    upi = models.CharField(max_length=50, unique=True)
    hectares = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    planted_crop = models.ForeignKey(Crop, null=True, blank=True, on_delete=models.SET_NULL, related_name="lands")
    season = models.CharField(max_length=1, choices=SEASON_CHOICES, null=True, blank=True)
    season_year = models.PositiveIntegerField(null=True, blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.upi} ({self.owner.full_name})"

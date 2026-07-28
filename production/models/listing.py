from django.conf import settings
from django.db import models

from .harvest import HarvestReport


class HarvestListing(models.Model):
    STATUS_AVAILABLE = "available"
    STATUS_RESERVED = "reserved"
    STATUS_SOLD = "sold"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Available"),
        (STATUS_RESERVED, "Reserved"),
        (STATUS_SOLD, "Sold"),
    ]

    harvest_report = models.ForeignKey(HarvestReport, on_delete=models.CASCADE, related_name="listings")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="harvest_listings")
    quantity_available_kg = models.DecimalField(max_digits=14, decimal_places=2)
    # Null = negotiable, farmer didn't set a fixed price.
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    reserved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reserved_listings"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.harvest_report.crop} {self.quantity_available_kg}kg ({self.status})"

from django.conf import settings
from django.db import models

from .catalog import Fertilizer
from .land import Land
from .livestock import LivestockLocation


class ResourceRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_DELIVERED = "delivered"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_DELIVERED, "Delivered"),
    ]

    RESOURCE_FERTILIZER = "fertilizer"
    RESOURCE_SEED = "seed"
    RESOURCE_MEDICINE = "medicine"
    RESOURCE_FEED = "feed"
    RESOURCE_TYPE_CHOICES = [
        (RESOURCE_FERTILIZER, "Fertilizer"),
        (RESOURCE_SEED, "Seed"),
        (RESOURCE_MEDICINE, "Medicine"),
        (RESOURCE_FEED, "Feed"),
    ]

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resource_requests")
    land = models.ForeignKey(Land, null=True, blank=True, on_delete=models.CASCADE, related_name="resource_requests")
    livestock_location = models.ForeignKey(
        LivestockLocation, null=True, blank=True, on_delete=models.CASCADE, related_name="resource_requests"
    )
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    # Set when resource_type=fertilizer, ties the request to the real superadmin-managed catalog.
    fertilizer = models.ForeignKey(Fertilizer, null=True, blank=True, on_delete=models.SET_NULL)
    quantity_requested = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=20, default="kg")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="resource_requests_assigned",
    )
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="resource_requests_decided",
    )
    decision_comment = models.TextField(blank=True)

    requested_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(land__isnull=False, livestock_location__isnull=True)
                    | models.Q(land__isnull=True, livestock_location__isnull=False)
                ),
                name="resource_request_target_is_exactly_one",
            ),
        ]

    @property
    def category(self):
        return "crop" if self.land_id else "livestock"

    def __str__(self):
        return f"{self.resource_type} request #{self.pk} ({self.status})"

from django.conf import settings
from django.db import models

from ai.models import AIQueryLog
from production.models import Land, LivestockLocation


class FarmerIssue(models.Model):
    """
    The human-approval gate: raised when the AI's answer didn't resolve the
    farmer's problem. Routed to the cell officer covering the land/livestock's
    cell, filtered by the matching specialization (crop -> agronomist,
    livestock -> veterinary). Nothing here is auto-actioned -- an officer
    reviews and responds.
    """

    CATEGORY_CROP = "crop"
    CATEGORY_LIVESTOCK = "livestock"
    CATEGORY_CHOICES = [(CATEGORY_CROP, "Crop"), (CATEGORY_LIVESTOCK, "Livestock")]

    STATUS_OPEN = "open"
    STATUS_ASSIGNED = "assigned"
    STATUS_RESOLVED = "resolved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_ASSIGNED, "Assigned"),
        (STATUS_RESOLVED, "Resolved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="issues_reported")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    # Exactly one of these is set, matching `category`.
    land = models.ForeignKey(Land, null=True, blank=True, on_delete=models.CASCADE, related_name="issues")
    livestock_location = models.ForeignKey(
        LivestockLocation, null=True, blank=True, on_delete=models.CASCADE, related_name="issues"
    )

    ai_query = models.ForeignKey(
        AIQueryLog, null=True, blank=True, on_delete=models.SET_NULL, related_name="escalations"
    )
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="issues_assigned"
    )

    officer_response = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="issues_resolved"
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(category="crop", land__isnull=False, livestock_location__isnull=True)
                    | models.Q(category="livestock", land__isnull=True, livestock_location__isnull=False)
                ),
                name="issue_target_matches_category",
            ),
        ]
        indexes = [models.Index(fields=["status", "category"])]

    def __str__(self):
        return f"Issue #{self.pk} ({self.category}, {self.status})"

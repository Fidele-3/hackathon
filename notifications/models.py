from django.conf import settings
from django.db import models

from reports.models import FarmerIssue


class Notification(models.Model):
    TYPE_ISSUE_ASSIGNED = "issue_assigned"
    TYPE_ISSUE_RESOLVED = "issue_resolved"
    TYPE_ANNOUNCEMENT = "announcement"
    TYPE_CHOICES = [
        (TYPE_ISSUE_ASSIGNED, "Issue assigned to you"),
        (TYPE_ISSUE_RESOLVED, "Your issue was resolved"),
        (TYPE_ANNOUNCEMENT, "Announcement"),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_issue = models.ForeignKey(
        FarmerIssue, null=True, blank=True, on_delete=models.CASCADE, related_name="notifications"
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient.full_name}"

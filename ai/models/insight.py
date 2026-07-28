from django.db import models

from users.models import District


class Insight(models.Model):
    SCOPE_NATIONAL = "national"
    SCOPE_DISTRICT = "district"
    SCOPE_CHOICES = [(SCOPE_NATIONAL, "National"), (SCOPE_DISTRICT, "District")]

    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    district = models.ForeignKey(District, null=True, blank=True, on_delete=models.CASCADE, related_name="insights")
    summary_date = models.DateField()
    content = models.TextField()
    model_used = models.CharField(max_length=100)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("scope", "district", "summary_date")
        ordering = ["-summary_date"]

    def __str__(self):
        target = self.district.name if self.district else "National"
        return f"{target} insight {self.summary_date}"

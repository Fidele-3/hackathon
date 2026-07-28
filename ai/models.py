from django.conf import settings
from django.db import models


class AIQueryLog(models.Model):
    """
    Every Gemini call the platform makes is logged here -- this is both the
    audit trail for the human-approval workflow and the raw data behind the
    'evaluation metrics' bonus criterion (accuracy/override rate is computed
    from this table, not asserted).
    """

    QUERY_CROP_DIAGNOSIS = "crop_diagnosis"
    QUERY_LIVESTOCK_QUERY = "livestock_query"
    QUERY_GENERAL_QA = "general_qa"
    QUERY_INSIGHT_GENERATION = "insight_generation"
    QUERY_TYPE_CHOICES = [
        (QUERY_CROP_DIAGNOSIS, "Crop disease diagnosis"),
        (QUERY_LIVESTOCK_QUERY, "Livestock query"),
        (QUERY_GENERAL_QA, "General farming Q&A"),
        (QUERY_INSIGHT_GENERATION, "Aggregate insight generation"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="ai_queries"
    )
    query_type = models.CharField(max_length=30, choices=QUERY_TYPE_CHOICES)
    model_used = models.CharField(max_length=100)

    input_text = models.TextField(blank=True)
    input_image = models.ImageField(upload_to="ai_queries/%Y/%m/", null=True, blank=True)

    response_text = models.TextField(blank=True)
    # Model's own confidence, when it reports one (e.g. diagnosis certainty). Not
    # invented by us -- null when the model didn't provide one.
    confidence_score = models.FloatField(null=True, blank=True)

    # True once the farmer has flagged this response as insufficient and escalated
    # to a human officer (see reports.FarmerIssue.ai_query).
    was_escalated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["query_type", "created_at"])]

    def __str__(self):
        return f"{self.query_type} @ {self.created_at:%Y-%m-%d %H:%M}"

from django.conf import settings
from django.db import models

from ai.media_paths import ai_query_audio_upload_to, ai_query_image_upload_to


class AIQueryLog(models.Model):
    QUERY_CROP_DIAGNOSIS = "crop_diagnosis"
    QUERY_LIVESTOCK_QUERY = "livestock_query"
    QUERY_GENERAL_QA = "general_qa"
    QUERY_INSIGHT_GENERATION = "insight_generation"
    QUERY_VOICE_MESSAGE = "voice_message"
    QUERY_TYPE_CHOICES = [
        (QUERY_CROP_DIAGNOSIS, "Crop disease diagnosis"),
        (QUERY_LIVESTOCK_QUERY, "Livestock query"),
        (QUERY_GENERAL_QA, "General farming Q&A"),
        (QUERY_INSIGHT_GENERATION, "Aggregate insight generation"),
        (QUERY_VOICE_MESSAGE, "Voice message"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="ai_queries"
    )
    query_type = models.CharField(max_length=30, choices=QUERY_TYPE_CHOICES)
    model_used = models.CharField(max_length=100)

    input_text = models.TextField(blank=True)
    input_image = models.ImageField(upload_to=ai_query_image_upload_to, null=True, blank=True)
    input_audio = models.FileField(upload_to=ai_query_audio_upload_to, null=True, blank=True)

    response_text = models.TextField(blank=True)
    # Null when the model itself didn't report a confidence -- never backfilled.
    confidence_score = models.FloatField(null=True, blank=True)

    was_escalated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["query_type", "created_at"])]

    def __str__(self):
        return f"{self.query_type} @ {self.created_at:%Y-%m-%d %H:%M}"

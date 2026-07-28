from rest_framework import serializers

from ai.models import Insight


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ["id", "scope", "district", "summary_date", "content", "model_used", "generated_at"]
        read_only_fields = fields

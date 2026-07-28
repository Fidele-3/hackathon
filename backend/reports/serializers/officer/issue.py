from django.utils import timezone
from rest_framework import serializers

from reports.models import FarmerIssue


class FarmerIssueResolveSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[FarmerIssue.STATUS_RESOLVED, FarmerIssue.STATUS_REJECTED])
    officer_response = serializers.CharField()

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.officer_response = validated_data["officer_response"]
        instance.resolved_by = self.context["request"].user
        instance.resolved_at = timezone.now()
        instance.save(update_fields=["status", "officer_response", "resolved_by", "resolved_at"])
        return instance

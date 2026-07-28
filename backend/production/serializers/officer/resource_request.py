from django.utils import timezone
from rest_framework import serializers

from production.models import ResourceRequest


class ResourceRequestDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[ResourceRequest.STATUS_APPROVED, ResourceRequest.STATUS_REJECTED, ResourceRequest.STATUS_DELIVERED]
    )
    decision_comment = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.decision_comment = validated_data.get("decision_comment", instance.decision_comment)
        instance.decided_by = self.context["request"].user
        now = timezone.now()
        if validated_data["status"] in (ResourceRequest.STATUS_APPROVED, ResourceRequest.STATUS_REJECTED):
            instance.decided_at = now
        if validated_data["status"] == ResourceRequest.STATUS_DELIVERED:
            instance.delivered_at = now
        instance.save(update_fields=["status", "decision_comment", "decided_by", "decided_at", "delivered_at"])
        return instance

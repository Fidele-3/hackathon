from django.utils import timezone
from rest_framework import serializers

from production.models import StorageRequest


class StorageRequestDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[StorageRequest.STATUS_APPROVED, StorageRequest.STATUS_REJECTED, StorageRequest.STATUS_STORED]
    )
    decision_comment = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        instance = self.instance
        if value == StorageRequest.STATUS_STORED and instance.status != StorageRequest.STATUS_APPROVED:
            raise serializers.ValidationError("Can only mark as stored after approval.")

        # Re-check capacity at approval time, not just at request time -- two
        # requests can each look fine individually against nominal capacity
        # if created before either is approved.
        if value == StorageRequest.STATUS_APPROVED and instance.status == StorageRequest.STATUS_REQUESTED:
            available = instance.warehouse.available_capacity_for_crop(instance.harvest_report.crop)
            if instance.quantity_kg > available:
                raise serializers.ValidationError(
                    f"Only {available}kg of capacity remains at this warehouse for this crop -- "
                    f"another request may have already been approved against it."
                )
        return value

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.decision_comment = validated_data.get("decision_comment", instance.decision_comment)
        instance.decided_by = self.context["request"].user
        now = timezone.now()
        if validated_data["status"] in (StorageRequest.STATUS_APPROVED, StorageRequest.STATUS_REJECTED):
            instance.decided_at = now
        if validated_data["status"] == StorageRequest.STATUS_STORED:
            instance.stored_at = now
        instance.save(update_fields=["status", "decision_comment", "decided_by", "decided_at", "stored_at"])
        return instance

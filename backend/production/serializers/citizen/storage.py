from django.db.models import Sum
from rest_framework import serializers

from production.models import StorageRequest, Warehouse


class StorageRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageRequest
        fields = [
            "id", "harvest_report", "warehouse", "quantity_kg", "status",
            "decided_by", "decision_comment", "requested_at", "decided_at", "stored_at",
        ]
        read_only_fields = [
            "id", "warehouse", "status", "decided_by", "decision_comment",
            "requested_at", "decided_at", "stored_at",
        ]

    def validate(self, attrs):
        harvest_report = attrs["harvest_report"]
        farmer = self.context["request"].user
        if harvest_report.land.owner_id != farmer.id:
            raise serializers.ValidationError("This harvest report is not yours.")

        already_requested = harvest_report.storage_requests.exclude(
            status=StorageRequest.STATUS_REJECTED
        ).aggregate(total=Sum("quantity_kg"))["total"] or 0
        remaining = harvest_report.quantity_kg - already_requested
        if attrs["quantity_kg"] > remaining:
            raise serializers.ValidationError(f"Only {remaining}kg of this harvest is not already requested for storage.")
        return attrs

    def create(self, validated_data):
        farmer = self.context["request"].user
        harvest_report = validated_data["harvest_report"]
        district = harvest_report.land.cell.sector.district

        warehouse = Warehouse.find_available_warehouse(district, harvest_report.crop, validated_data["quantity_kg"])
        if not warehouse:
            raise serializers.ValidationError(
                "No government warehouse in your district currently has capacity for this crop/quantity."
            )

        validated_data["farmer"] = farmer
        validated_data["warehouse"] = warehouse
        return super().create(validated_data)

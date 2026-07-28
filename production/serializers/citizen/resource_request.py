from rest_framework import serializers

from production.models import ResourceRequest
from reports.routing import find_cell_officer


class ResourceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceRequest
        fields = [
            "id", "land", "livestock_location", "resource_type", "fertilizer",
            "quantity_requested", "unit", "status", "assigned_officer",
            "decision_comment", "requested_at", "decided_at", "delivered_at",
        ]
        read_only_fields = [
            "id", "status", "assigned_officer", "decision_comment",
            "requested_at", "decided_at", "delivered_at",
        ]

    def validate(self, attrs):
        land = attrs.get("land")
        livestock_location = attrs.get("livestock_location")
        if bool(land) == bool(livestock_location):
            raise serializers.ValidationError("Provide exactly one of land or livestock_location.")

        farmer = self.context["request"].user
        target = land or livestock_location
        if target.owner_id != farmer.id:
            raise serializers.ValidationError("This land/livestock does not belong to you.")
        return attrs

    def create(self, validated_data):
        farmer = self.context["request"].user
        land = validated_data.get("land")
        category = "crop" if land else "livestock"
        cell = land.cell if land else validated_data["livestock_location"].cell

        officer_profile = find_cell_officer(cell, category)
        if not officer_profile:
            raise serializers.ValidationError(f"No officer covering '{category}' requests is assigned to this cell.")

        validated_data["farmer"] = farmer
        validated_data["assigned_officer"] = officer_profile.user
        return super().create(validated_data)

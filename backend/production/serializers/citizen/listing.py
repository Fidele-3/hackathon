from rest_framework import serializers

from production.models import HarvestListing


class HarvestListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestListing
        fields = [
            "id", "harvest_report", "quantity_available_kg", "price_per_kg",
            "status", "reserved_by", "created_at",
        ]
        read_only_fields = ["id", "status", "reserved_by", "created_at"]

    def validate_harvest_report(self, value):
        if value.land.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("This harvest report is not yours.")
        return value

    def validate(self, attrs):
        if attrs["quantity_available_kg"] > attrs["harvest_report"].quantity_kg:
            raise serializers.ValidationError("Cannot list more than the reported harvest quantity.")
        return attrs

    def create(self, validated_data):
        validated_data["farmer"] = self.context["request"].user
        return super().create(validated_data)

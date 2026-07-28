from rest_framework import serializers

from production.models import LivestockLocation, LivestockProduction


class LivestockLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivestockLocation
        fields = ["id", "cell", "livestock_type", "count", "registered_at"]
        read_only_fields = ["id", "registered_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class LivestockProductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivestockProduction
        fields = [
            "id", "livestock_location", "product_type", "season", "season_year",
            "quantity", "unit", "source", "created_at",
        ]
        read_only_fields = ["id", "source", "created_at"]

    def validate_livestock_location(self, value):
        if value.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("This livestock location does not belong to you.")
        return value

    def create(self, validated_data):
        validated_data["reported_by"] = self.context["request"].user
        return super().create(validated_data)

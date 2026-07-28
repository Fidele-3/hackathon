from rest_framework import serializers

from production.models import HarvestReport


class HarvestReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestReport
        fields = ["id", "land", "crop", "season", "season_year", "quantity_kg", "source", "created_at"]
        read_only_fields = ["id", "source", "created_at"]

    def validate_land(self, value):
        if value.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("This land does not belong to you.")
        return value

    def create(self, validated_data):
        validated_data["reported_by"] = self.context["request"].user
        return super().create(validated_data)

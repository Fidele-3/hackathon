from rest_framework import serializers

from production.models import Land


class LandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Land
        fields = ["id", "cell", "upi", "hectares", "planted_crop", "season", "season_year", "registered_at"]
        read_only_fields = ["id", "registered_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)

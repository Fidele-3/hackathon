from rest_framework import serializers

from ai.models import AIQueryLog
from reports.models import FarmerIssue
from users.serializers.common.profile import MeSerializer


class AIQueryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIQueryLog
        fields = [
            "id", "query_type", "model_used", "input_text", "input_image",
            "input_audio", "response_text", "confidence_score", "created_at",
        ]
        read_only_fields = fields


class FarmerIssueSerializer(serializers.ModelSerializer):
    reporter = MeSerializer(read_only=True)
    assigned_officer = MeSerializer(read_only=True)
    # Null unless the farmer escalated this issue out of an AI conversation --
    # lets an officer see what the AI already saw/said (including any photo
    # or voice note) before deciding how to respond themselves.
    ai_query = AIQueryLogSerializer(read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    cell_name = serializers.SerializerMethodField()

    class Meta:
        model = FarmerIssue
        fields = [
            "id", "category", "land", "livestock_location", "description",
            "status", "reporter", "assigned_officer", "officer_response",
            "resolved_at", "created_at", "latitude", "longitude", "cell_name", "ai_query",
        ]
        read_only_fields = fields

    def _cell(self, obj):
        if obj.land_id:
            return obj.land.cell
        if obj.livestock_location_id:
            return obj.livestock_location.cell
        return None

    def get_latitude(self, obj):
        cell = self._cell(obj)
        return cell.latitude if cell else None

    def get_longitude(self, obj):
        cell = self._cell(obj)
        return cell.longitude if cell else None

    def get_cell_name(self, obj):
        cell = self._cell(obj)
        return cell.name if cell else None

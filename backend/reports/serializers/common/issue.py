from rest_framework import serializers

from reports.models import FarmerIssue
from users.serializers.common.profile import MeSerializer


class FarmerIssueSerializer(serializers.ModelSerializer):
    reporter = MeSerializer(read_only=True)
    assigned_officer = MeSerializer(read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    cell_name = serializers.SerializerMethodField()

    class Meta:
        model = FarmerIssue
        fields = [
            "id", "category", "land", "livestock_location", "description",
            "status", "reporter", "assigned_officer", "officer_response",
            "resolved_at", "created_at", "latitude", "longitude", "cell_name",
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

from rest_framework import serializers

from reports.models import FarmerIssue
from users.serializers.common.profile import MeSerializer


class FarmerIssueSerializer(serializers.ModelSerializer):
    reporter = MeSerializer(read_only=True)
    assigned_officer = MeSerializer(read_only=True)

    class Meta:
        model = FarmerIssue
        fields = [
            "id", "category", "land", "livestock_location", "description",
            "status", "reporter", "assigned_officer", "officer_response",
            "resolved_at", "created_at",
        ]
        read_only_fields = fields

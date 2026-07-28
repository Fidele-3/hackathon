from rest_framework import serializers

from ai.models import AIQueryLog
from production.models import Land, LivestockLocation
from reports.models import Conversation, FarmerIssue
from reports.routing import find_cell_officer


class EscalateConversationSerializer(serializers.Serializer):
    land = serializers.PrimaryKeyRelatedField(queryset=Land.objects.all(), required=False)
    livestock_location = serializers.PrimaryKeyRelatedField(queryset=LivestockLocation.objects.all(), required=False)
    description = serializers.CharField()

    def validate(self, attrs):
        land = attrs.get("land")
        livestock_location = attrs.get("livestock_location")
        if bool(land) == bool(livestock_location):
            raise serializers.ValidationError("Provide exactly one of land or livestock_location.")

        farmer = self.context["conversation"].farmer
        target = land or livestock_location
        if target.owner_id != farmer.id:
            raise serializers.ValidationError("This land/livestock does not belong to you.")
        return attrs

    def create(self, validated_data):
        conversation = self.context["conversation"]
        farmer = conversation.farmer
        land = validated_data.get("land")
        livestock_location = validated_data.get("livestock_location")
        category = FarmerIssue.CATEGORY_CROP if land else FarmerIssue.CATEGORY_LIVESTOCK
        cell = land.cell if land else livestock_location.cell

        officer_profile = find_cell_officer(cell, category)
        if not officer_profile:
            raise serializers.ValidationError(
                f"No officer covering '{category}' issues is currently assigned to this cell."
            )

        last_ai_query = (
            conversation.messages.filter(is_ai_message=True, ai_query__isnull=False)
            .order_by("-created_at")
            .first()
        )
        ai_query = last_ai_query.ai_query if last_ai_query else None

        issue = FarmerIssue.objects.create(
            reporter=farmer,
            category=category,
            land=land,
            livestock_location=livestock_location,
            ai_query=ai_query,
            description=validated_data["description"],
            status=FarmerIssue.STATUS_ASSIGNED,
            assigned_officer=officer_profile.user,
        )
        if ai_query:
            ai_query.was_escalated = True
            ai_query.save(update_fields=["was_escalated"])

        officer_conversation, _ = Conversation.objects.get_or_create(
            farmer=farmer,
            channel=Conversation.CHANNEL_OFFICER,
            officer=officer_profile.user,
            defaults={"related_issue": issue},
        )
        if officer_conversation.related_issue_id is None:
            officer_conversation.related_issue = issue
            officer_conversation.save(update_fields=["related_issue"])

        return issue, officer_conversation

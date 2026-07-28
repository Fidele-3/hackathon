from rest_framework import serializers

from reports.models import Conversation, FarmerIssue, Message, MessageAttachment
from reports.routing import find_cell_officer
from users.serializers.common.profile import MeSerializer


class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ["id", "file", "thumbnail", "file_type", "hls_master", "hls_720", "processing_status"]
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender = MeSerializer(read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "is_ai_message", "body", "attachments", "created_at"]
        read_only_fields = ["id", "conversation", "sender", "is_ai_message", "created_at"]


class SendMessageSerializer(serializers.Serializer):
    body = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.FileField(required=False)

    def validate(self, attrs):
        if not attrs.get("body") and not attrs.get("attachment"):
            raise serializers.ValidationError("A message needs a body, an attachment, or both.")
        return attrs


class ConversationSerializer(serializers.ModelSerializer):
    officer = MeSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = ["public_id", "channel", "officer", "related_issue", "created_at", "updated_at"]
        read_only_fields = fields


class StartConversationSerializer(serializers.Serializer):
    channel = serializers.ChoiceField(choices=Conversation.CHANNEL_CHOICES)
    # Required when channel="officer" -- determines whether this routes to
    # the cell's agronomist or its veterinary officer.
    category = serializers.ChoiceField(choices=FarmerIssue.CATEGORY_CHOICES, required=False)

    def validate(self, attrs):
        if attrs["channel"] == Conversation.CHANNEL_OFFICER and not attrs.get("category"):
            raise serializers.ValidationError({"category": "Required to route to the right officer."})
        return attrs

    def create(self, validated_data):
        farmer = self.context["request"].user
        channel = validated_data["channel"]

        if channel == Conversation.CHANNEL_AI:
            conversation, _ = Conversation.objects.get_or_create(
                farmer=farmer, channel=Conversation.CHANNEL_AI, officer=None
            )
            return conversation

        if not farmer.village:
            raise serializers.ValidationError(
                "Register a village on your profile before messaging your cell officer."
            )
        category = validated_data["category"]
        officer_profile = find_cell_officer(farmer.village.cell, category)
        if not officer_profile:
            raise serializers.ValidationError(
                f"No officer covering '{category}' issues is currently assigned to your cell."
            )

        conversation, _ = Conversation.objects.get_or_create(
            farmer=farmer, channel=Conversation.CHANNEL_OFFICER, officer=officer_profile.user
        )
        return conversation

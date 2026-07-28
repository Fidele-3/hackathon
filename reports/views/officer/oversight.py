from rest_framework import generics
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from reports.models import Conversation
from reports.serializers.common.messaging import ConversationSerializer, MessageSerializer
from users.permissions import IsOfficer
from users.scoping import officer_jurisdiction_filter


def _jurisdiction_conversations(user):
    return Conversation.objects.filter(
        channel=Conversation.CHANNEL_AI
    ).filter(officer_jurisdiction_filter(user, "farmer__village__cell"))


class OfficerAIConversationListView(generics.ListAPIView):
    """
    Oversight view: every AI conversation (app or USSD-originated) from a
    farmer in the officer's jurisdiction -- not just ones a farmer chose to
    escalate. Read-only; an officer follows up via escalation-triggered
    messaging, not by editing here.
    """

    serializer_class = ConversationSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return _jurisdiction_conversations(self.request.user)


class OfficerAIConversationMessagesView(generics.GenericAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsOfficer]

    def get(self, request, public_id):
        conversation = get_object_or_404(_jurisdiction_conversations(request.user), public_id=public_id)
        messages = conversation.messages.select_related("sender").prefetch_related("attachments")
        return Response(MessageSerializer(messages, many=True).data)

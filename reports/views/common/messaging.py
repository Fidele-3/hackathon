from django.db.models import Q
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from reports.models import Conversation, Message, MessageAttachment
from reports.serializers.common.messaging import (
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    StartConversationSerializer,
)
from reports.tasks import process_chat_attachment_video_task


class ConversationListCreateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(farmer=user) | Q(officer=user))

    def get(self, request):
        conversations = self.get_queryset()
        return Response(ConversationSerializer(conversations, many=True).data)

    def post(self, request):
        serializer = StartConversationSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)


class MessageListCreateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def _get_conversation(self, request, public_id):
        conversation = get_object_or_404(Conversation, public_id=public_id)
        if request.user not in (conversation.farmer, conversation.officer):
            raise PermissionDenied("You are not a participant in this conversation.")
        return conversation

    def get(self, request, public_id):
        conversation = self._get_conversation(request, public_id)
        messages = conversation.messages.select_related("sender").prefetch_related("attachments")
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, public_id):
        conversation = self._get_conversation(request, public_id)
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            body=serializer.validated_data.get("body", ""),
        )

        attachment_file = serializer.validated_data.get("attachment")
        if attachment_file:
            content_type = getattr(attachment_file, "content_type", "") or ""
            attachment = MessageAttachment.objects.create(
                message=message,
                file=attachment_file,
                file_type=content_type,
                processing_status=(
                    MessageAttachment.ProcessingStatus.PENDING
                    if content_type.startswith("video")
                    else MessageAttachment.ProcessingStatus.NOT_NEEDED
                ),
            )
            if content_type.startswith("video"):
                process_chat_attachment_video_task.delay(attachment.id)

        conversation.save(update_fields=["updated_at"])
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

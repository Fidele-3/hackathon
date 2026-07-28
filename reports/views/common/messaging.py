import logging

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ai.gemini_client import CHAT_MODEL, GeminiError, generate_content
from ai.models import AIQueryLog
from reports.models import Conversation, Message, MessageAttachment
from reports.serializers.common.escalation import EscalateConversationSerializer
from reports.serializers.common.issue import FarmerIssueSerializer
from reports.serializers.common.messaging import (
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    StartConversationSerializer,
)
from reports.tasks import process_chat_attachment_video_task

logger = logging.getLogger(__name__)


def _generate_ai_reply(conversation, farmer, body, attachment_file):
    image_bytes = None
    image_mime_type = None
    is_image = attachment_file and (getattr(attachment_file, "content_type", "") or "").startswith("image")
    if is_image:
        image_mime_type = attachment_file.content_type
        attachment_file.seek(0)
        image_bytes = attachment_file.read()
        attachment_file.seek(0)

    query_type = AIQueryLog.QUERY_CROP_DIAGNOSIS if is_image else AIQueryLog.QUERY_GENERAL_QA

    try:
        response_text = generate_content(CHAT_MODEL, body, image_bytes=image_bytes, image_mime_type=image_mime_type)
    except GeminiError:
        logger.exception("Gemini call failed for conversation %s", conversation.pk)
        response_text = ""

    log = AIQueryLog.objects.create(
        user=farmer,
        query_type=query_type,
        model_used=CHAT_MODEL,
        input_text=body,
        response_text=response_text,
        input_image=attachment_file if is_image else None,
    )

    reply_body = response_text or (
        "The assistant couldn't process this right now. You can try again, or escalate this "
        "conversation to your cell officer."
    )
    return Message.objects.create(
        conversation=conversation, sender=None, is_ai_message=True, body=reply_body, ai_query=log
    )


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

        response_messages = [message]
        if conversation.channel == Conversation.CHANNEL_AI:
            ai_message = _generate_ai_reply(
                conversation, request.user, serializer.validated_data.get("body", ""), attachment_file
            )
            response_messages.append(ai_message)
            conversation.save(update_fields=["updated_at"])

        return Response(MessageSerializer(response_messages, many=True).data, status=status.HTTP_201_CREATED)


class EscalateConversationView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EscalateConversationSerializer

    def post(self, request, public_id):
        conversation = get_object_or_404(Conversation, public_id=public_id, farmer=request.user)
        if conversation.channel != Conversation.CHANNEL_AI:
            raise PermissionDenied("Only an AI conversation can be escalated.")

        serializer = self.get_serializer(data=request.data, context={"conversation": conversation})
        serializer.is_valid(raise_exception=True)
        issue, officer_conversation = serializer.save()

        return Response(
            {
                "issue": FarmerIssueSerializer(issue).data,
                "officer_conversation": ConversationSerializer(officer_conversation).data,
            },
            status=status.HTTP_201_CREATED,
        )

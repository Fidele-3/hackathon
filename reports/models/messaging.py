import uuid

from django.conf import settings
from django.db import models

from ai.media_paths import chat_attachment_upload_to, chat_thumbnail_upload_to
from ai.models import AIQueryLog

from .issues import FarmerIssue


class Conversation(models.Model):
    CHANNEL_OFFICER = "officer"
    CHANNEL_AI = "ai"
    CHANNEL_CHOICES = [(CHANNEL_OFFICER, "Officer chat"), (CHANNEL_AI, "AI chatbot")]

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")
    # Set only for channel=officer; always the farmer's assigned cell officer.
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="officer_conversations"
    )
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    related_issue = models.ForeignKey(
        FarmerIssue, null=True, blank=True, on_delete=models.SET_NULL, related_name="conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(channel="officer", officer__isnull=False)
                    | models.Q(channel="ai", officer__isnull=True)
                ),
                name="conversation_officer_matches_channel",
            ),
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation #{self.pk} ({self.channel})"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    # Null when the message is the AI's own reply.
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="sent_messages"
    )
    is_ai_message = models.BooleanField(default=False)
    body = models.TextField(blank=True)
    # Set when this message is an AI reply, linking back to the full Gemini
    # call (model used, confidence, etc.) that produced it.
    ai_query = models.ForeignKey(
        AIQueryLog, null=True, blank=True, on_delete=models.SET_NULL, related_name="chat_messages"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message #{self.pk} in conversation #{self.conversation_id}"


class MessageAttachment(models.Model):
    class ProcessingStatus(models.TextChoices):
        NOT_NEEDED = "not_needed", "Not needed"
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to=chat_attachment_upload_to)
    thumbnail = models.ImageField(upload_to=chat_thumbnail_upload_to, null=True, blank=True)
    file_type = models.CharField(max_length=50, blank=True)

    hls_master = models.FileField(max_length=500, blank=True, null=True)
    hls_720 = models.FileField(max_length=500, blank=True, null=True)
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.NOT_NEEDED
    )
    processing_attempts = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return f"Attachment #{self.pk} for message #{self.message_id}"

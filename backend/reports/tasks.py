import logging
import os
import shutil

from celery import shared_task
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)


def _to_relative_media_path(*parts):
    return "/".join(str(part).strip("/") for part in parts)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
    retry_backoff=True,
    retry_jitter=True,
)
def process_chat_attachment_video_task(self, attachment_id: int):
    from reports.models import MessageAttachment
    from reports.services.video_processing import transcode_to_adaptive_hls

    with transaction.atomic():
        attachment = MessageAttachment.objects.select_for_update().get(id=attachment_id)

        if not (attachment.file_type or "").startswith("video"):
            return
        if not attachment.file:
            return
        if attachment.processing_status == MessageAttachment.ProcessingStatus.READY:
            return

        attachment.processing_status = MessageAttachment.ProcessingStatus.PROCESSING
        attachment.processing_attempts += 1
        attachment.save(update_fields=["processing_status", "processing_attempts"])

    try:
        input_path = attachment.file.path
        relative_output_dir = _to_relative_media_path("ubuhinzi", "hls", "chat-attachments", str(attachment.id))
        absolute_output_dir = os.path.join(settings.MEDIA_ROOT, relative_output_dir)

        if os.path.exists(absolute_output_dir):
            shutil.rmtree(absolute_output_dir)
        os.makedirs(absolute_output_dir, exist_ok=True)

        result = transcode_to_adaptive_hls(input_path=input_path, output_dir=absolute_output_dir)
        variant_playlists = result.get("variant_playlists", {})

        def _variant_rel(name):
            if name in variant_playlists:
                return _to_relative_media_path(relative_output_dir, variant_playlists[name])
            return None

        with transaction.atomic():
            attachment = MessageAttachment.objects.select_for_update().get(id=attachment_id)
            attachment.hls_master = _to_relative_media_path(relative_output_dir, result["master_playlist"])
            attachment.hls_720 = _variant_rel("720p") or _variant_rel("480p")
            attachment.thumbnail = _to_relative_media_path(relative_output_dir, result["thumbnail"])
            attachment.processing_status = MessageAttachment.ProcessingStatus.READY
            attachment.save(update_fields=["hls_master", "hls_720", "thumbnail", "processing_status"])
        logger.info("[ChatAttachment %s] HLS transcoding completed.", attachment_id)
    except Exception:
        MessageAttachment.objects.filter(id=attachment_id).update(
            processing_status=MessageAttachment.ProcessingStatus.FAILED
        )
        raise


@shared_task
def check_unprocessed_chat_attachments_task():
    from reports.models import MessageAttachment

    pending = MessageAttachment.objects.filter(
        file_type__startswith="video",
        processing_attempts__lt=3,
    ).exclude(
        processing_status__in=[
            MessageAttachment.ProcessingStatus.READY,
            MessageAttachment.ProcessingStatus.PROCESSING,
            MessageAttachment.ProcessingStatus.NOT_NEEDED,
        ]
    )

    count = 0
    for attachment in pending:
        process_chat_attachment_video_task.delay(attachment.id)
        count += 1
    if count:
        logger.info("Scheduled %s unprocessed chat attachments for re-processing.", count)

import os
import uuid
from datetime import datetime

# Every upload in this project lives under one bucket-level prefix so the
# whole project's media can be found/deleted as a single unit inside a
# bucket shared with other projects (mirrors ~/Documents/inzufinder's
# generate_path helper, with this project's fixed root added).
PROJECT_ROOT = "ubuhinzi"


def generate_path(base_folder, filename):
    ext = filename.split(".")[-1]
    original_name = os.path.splitext(filename)[0].replace(" ", "_")
    new_filename = f"{uuid.uuid4()}-{original_name}.{ext}"
    today = datetime.today()
    return f"{PROJECT_ROOT}/{base_folder}/{today.year}/{today.month}/{new_filename}"


def ai_query_image_upload_to(instance, filename):
    return generate_path("ai_query_images", filename)


def ai_query_audio_upload_to(instance, filename):
    return generate_path("ai_query_audio", filename)


def chat_attachment_upload_to(instance, filename):
    return generate_path("chat_attachments", filename)


def chat_thumbnail_upload_to(instance, filename):
    return generate_path("chat_thumbnails", filename)

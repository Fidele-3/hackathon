"""Model router — maps task types to Gemini models."""

from __future__ import annotations

from enum import Enum

# Verified live against available Google AI models for this project key.
CHAT_MODEL = "gemini-3-flash-preview"
VISION_MODEL = "gemini-3-flash-preview"
INSIGHT_MODEL = "gemini-3.1-pro-preview"
VOICE_MODEL = "gemini-3-flash-preview"


class AITask(str, Enum):
    CROP_DIAGNOSIS = "crop_diagnosis"
    LIVESTOCK_DIAGNOSIS = "livestock_diagnosis"
    GENERAL_QA = "general_qa"
    INSIGHT = "insight"
    VOICE_TRANSCRIBE = "voice_transcribe"
    VOICE_SPEAK = "voice_speak"
    FIELD_VIDEO = "field_video"  # deferred — architecture hook


def resolve_model(task: AITask) -> str:
    mapping = {
        AITask.CROP_DIAGNOSIS: VISION_MODEL,
        AITask.LIVESTOCK_DIAGNOSIS: VISION_MODEL,
        AITask.GENERAL_QA: CHAT_MODEL,
        AITask.INSIGHT: INSIGHT_MODEL,
        AITask.VOICE_TRANSCRIBE: VOICE_MODEL,
        AITask.VOICE_SPEAK: VOICE_MODEL,
        AITask.FIELD_VIDEO: VISION_MODEL,
    }
    return mapping[task]

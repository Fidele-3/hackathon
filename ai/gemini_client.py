"""Low-level Gemini HTTP client. UI must never call this — use ai.orchestration."""

from __future__ import annotations

import base64
import json
import logging
import re
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# Re-export for callers that still import from this module.
from ai.model_router import CHAT_MODEL, INSIGHT_MODEL, VISION_MODEL  # noqa: E402

SYSTEM_INSTRUCTION = (
    "You are e-Hinga AI, an agricultural extension expert for smallholder farmers in Rwanda. "
    "When given a photo, identify the likely crop disease or livestock health issue and "
    "give a clear, actionable recommendation suited to a smallholder farmer. If you are "
    "not confident, say so explicitly and recommend contacting the local cell officer "
    "rather than guessing. Never invent a diagnosis you are not reasonably sure of. "
    "Consider Rwanda's climate, common crops (maize, beans, banana, potato, cassava, coffee, tea), "
    "and practices available to smallholders."
)


class GeminiError(Exception):
    pass


def _api_key() -> str:
    key = getattr(settings, "GOOGLE_AI_API_KEY", None) or getattr(settings, "GEMINI_API_KEY", None) or ""
    if not key:
        raise GeminiError("GOOGLE_AI_API_KEY is not configured.")
    return key


def _build_contents(
    text: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
    audio_bytes: bytes | None = None,
    audio_mime_type: str | None = None,
) -> list[dict[str, Any]]:
    parts: list[dict[str, Any]] = []
    if image_bytes:
        parts.append({
            "inline_data": {
                "mime_type": image_mime_type or "image/jpeg",
                "data": base64.b64encode(image_bytes).decode("ascii"),
            }
        })
    if audio_bytes:
        parts.append({
            "inline_data": {
                "mime_type": audio_mime_type or "audio/webm",
                "data": base64.b64encode(audio_bytes).decode("ascii"),
            }
        })
    parts.append({"text": text or "Describe what you see and any concerns."})
    return [{"role": "user", "parts": parts}]


def generate_content(
    model: str,
    text: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
    audio_bytes: bytes | None = None,
    audio_mime_type: str | None = None,
    system_instruction: str | None = None,
    timeout: int = 60,
) -> str:
    url = f"{GEMINI_API_BASE}/models/{model}:generateContent"
    payload = {
        "contents": _build_contents(
            text,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
            audio_bytes=audio_bytes,
            audio_mime_type=audio_mime_type,
        ),
        "systemInstruction": {"parts": [{"text": system_instruction or SYSTEM_INSTRUCTION}]},
        "generationConfig": {"temperature": 0.2},
    }
    response = requests.post(url, params={"key": _api_key()}, json=payload, timeout=timeout)
    if response.status_code != 200:
        raise GeminiError(f"Gemini API error {response.status_code}: {response.text[:500]}")

    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise GeminiError("Gemini returned no candidates.")

    parts = candidates[0].get("content", {}).get("parts", [])
    text_out = "".join(part.get("text", "") for part in parts)
    if not text_out:
        raise GeminiError("Gemini returned an empty response.")
    return text_out


def extract_json(text: str) -> dict[str, Any]:
    """Parse JSON from a model response, tolerating markdown fences."""
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if fence:
        cleaned = fence.group(1).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start >= 0 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise GeminiError("Model did not return valid JSON.")

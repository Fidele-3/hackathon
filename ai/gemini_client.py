import base64

import requests
from django.conf import settings

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# Confirmed live against this key (2026-07-28) -- gemini-2.5-flash,
# gemini-2.0-flash and gemini-3-pro-preview all 404 despite being listed by
# the /models endpoint, so availability was verified by an actual call, not
# assumed from the model list.
CHAT_MODEL = "gemini-3-flash-preview"
INSIGHT_MODEL = "gemini-3.1-pro-preview"

SYSTEM_INSTRUCTION = (
    "You are an agricultural extension assistant for smallholder farmers in Rwanda. "
    "When given a photo, identify the likely crop disease or livestock health issue and "
    "give a clear, actionable recommendation suited to a smallholder farmer. If you are "
    "not confident, say so explicitly and recommend contacting the local cell officer "
    "rather than guessing. Never invent a diagnosis you are not reasonably sure of."
)


class GeminiError(Exception):
    pass


def _build_contents(text, image_bytes=None, image_mime_type=None):
    parts = []
    if image_bytes:
        parts.append({
            "inline_data": {
                "mime_type": image_mime_type or "image/jpeg",
                "data": base64.b64encode(image_bytes).decode("ascii"),
            }
        })
    parts.append({"text": text or "Describe what you see and any concerns."})
    return [{"role": "user", "parts": parts}]


def generate_content(model, text, image_bytes=None, image_mime_type=None, timeout=30):
    url = f"{GEMINI_API_BASE}/models/{model}:generateContent"
    payload = {
        "contents": _build_contents(text, image_bytes, image_mime_type),
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
    }
    response = requests.post(url, params={"key": settings.GEMINI_API_KEY}, json=payload, timeout=timeout)
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

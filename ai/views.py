"""AI API views — thin HTTP adapters over ai.orchestration."""

from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.agents.escalation import EscalationError
from ai.gemini_client import GeminiError
from ai.orchestration import (
    escalate_diagnosis,
    officer_priority_feed,
    run_crop_diagnosis,
    run_field_scan,
    transcribe_audio,
)
from users.permissions import IsOfficer

logger = logging.getLogger(__name__)


def _lang(request) -> str:
    language = (request.data.get("language") or "en").lower()
    return "rw" if language.startswith("rw") else "en"


class CropScanView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        text = request.data.get("text") or request.data.get("message") or ""
        language = _lang(request)
        land_id = request.data.get("land_id")
        auto_escalate = str(request.data.get("auto_escalate", "true")).lower() in ("1", "true", "yes")

        image = request.FILES.get("image") or request.FILES.get("file")
        image_bytes = None
        image_mime = None
        image_name = "crop.jpg"
        if image:
            image_bytes = image.read()
            image_mime = getattr(image, "content_type", None) or "image/jpeg"
            image_name = getattr(image, "name", "crop.jpg")

        if not image_bytes and not text:
            return Response(
                {"detail": "Provide an image and/or text description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = run_crop_diagnosis(
                user=request.user,
                text=text,
                image_bytes=image_bytes,
                image_mime_type=image_mime,
                image_name=image_name,
                language=language,
                land_id=int(land_id) if land_id else None,
                auto_escalate=auto_escalate,
            )
        except GeminiError as exc:
            logger.exception("Crop scan Gemini failure")
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.exception("Unexpected crop scan error")
            return Response(
                {"detail": "Something went wrong. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(result, status=status.HTTP_200_OK)


class EscalateDiagnosisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        diagnosis_id = request.data.get("diagnosis_id")
        land_id = request.data.get("land_id")
        if not diagnosis_id:
            return Response({"detail": "diagnosis_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = escalate_diagnosis(
                user=request.user,
                diagnosis_id=int(diagnosis_id),
                land_id=int(land_id) if land_id else None,
            )
        except EscalationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(result, status=status.HTTP_200_OK)


class VoiceTranscribeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        audio = request.FILES.get("audio") or request.FILES.get("file")
        if not audio:
            return Response({"detail": "audio file is required."}, status=status.HTTP_400_BAD_REQUEST)
        language = _lang(request)
        try:
            transcript = transcribe_audio(
                audio_bytes=audio.read(),
                audio_mime_type=getattr(audio, "content_type", None) or "audio/webm",
                language=language,
            )
        except GeminiError as exc:
            logger.exception("Voice transcription failed")
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"transcript": transcript, "language": language})


class VoiceSpeakView(APIView):
    """Best-effort TTS. Returns text for client-side speechSynthesis when API TTS unavailable."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = (request.data.get("text") or "").strip()
        language = _lang(request)
        if not text:
            return Response({"detail": "text is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "text": text,
            "language": language,
            "tts": "browser",
            "message": "Use browser speechSynthesis for playback.",
        })


class OfficerPriorityFeedView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def get(self, request):
        feed = officer_priority_feed(officer=request.user)
        return Response({"results": feed})


class FieldScanView(APIView):
    """Farm walk video → locate crops / affected area (Gemini video + optional Nano Banana hint)."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        import base64
        import json

        language = _lang(request)
        text = request.data.get("text") or ""
        nano_raw = request.data.get("nano_hint") or ""
        nano_hint = None
        if nano_raw:
            try:
                nano_hint = json.loads(nano_raw) if isinstance(nano_raw, str) else nano_raw
            except (TypeError, json.JSONDecodeError):
                nano_hint = {"note": str(nano_raw)[:500]}

        video = request.FILES.get("video") or request.FILES.get("file")
        video_bytes = video.read() if video else None
        video_mime = (getattr(video, "content_type", None) if video else None) or "video/mp4"
        # iPhone often sends video/quicktime — Gemini prefers video/mp4 labeling
        if video_mime in ("video/quicktime", "video/x-m4v", "application/octet-stream"):
            video_mime = "video/mp4"

        frame_images: list[tuple[bytes, str]] = []
        # Accept up to 6 JPEG frames from the client (Nano Banana / browser sampling)
        for key in request.FILES:
            if key.startswith("frame"):
                f = request.FILES[key]
                frame_images.append((f.read(), getattr(f, "content_type", None) or "image/jpeg"))

        # Also accept base64 frames JSON list
        frames_b64 = request.data.get("frames_b64")
        if frames_b64 and not frame_images:
            try:
                payload = json.loads(frames_b64) if isinstance(frames_b64, str) else frames_b64
                for item in (payload or [])[:6]:
                    raw = base64.b64decode(item.split(",")[-1] if isinstance(item, str) else item)
                    frame_images.append((raw, "image/jpeg"))
            except Exception:
                logger.exception("Failed to decode frames_b64")

        if not video_bytes and not frame_images:
            return Response(
                {"detail": "Provide a field video and/or sampled frames."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = run_field_scan(
                user=request.user,
                text=text,
                video_bytes=video_bytes,
                video_mime_type=video_mime,
                frame_images=frame_images or None,
                language=language,
                nano_hint=nano_hint,
            )
        except GeminiError as exc:
            logger.exception("Field scan failed")
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)
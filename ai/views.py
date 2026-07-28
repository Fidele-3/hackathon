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

"""AI orchestration service — single entry point for all product AI features.

Frontend / views call this layer. Never call Gemini from UI or thin views.
"""

from __future__ import annotations

import logging
from typing import Any

from django.core.files.base import ContentFile

from ai.agents.crop_health import run_crop_health_agent
from ai.agents.escalation import EscalationError, decide_and_escalate
from ai.gemini_client import GeminiError, generate_content
from ai.model_router import AITask, resolve_model
from ai.models import AIQueryLog
from ai.schemas import CropDiagnosisResult, Language
from production.models import Land

logger = logging.getLogger(__name__)


def run_crop_diagnosis(
    *,
    user,
    text: str = "",
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
    image_name: str = "crop.jpg",
    language: Language = "en",
    land_id: int | None = None,
    auto_escalate: bool = True,
) -> dict[str, Any]:
    """Run Crop Health Agent, persist AIQueryLog, optionally escalate."""
    if not image_bytes and not text:
        raise ValueError("Provide an image and/or a text description.")

    diagnosis = run_crop_health_agent(
        text=text,
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
        language=language,
    )

    model = resolve_model(AITask.CROP_DIAGNOSIS)
    log = AIQueryLog(
        user=user,
        query_type=AIQueryLog.QUERY_CROP_DIAGNOSIS,
        model_used=model,
        input_text=text,
        response_text=diagnosis.explanation or diagnosis.recommendation,
        confidence_score=diagnosis.confidence,
        structured_response=diagnosis.to_dict(),
        severity=diagnosis.severity,
        language=language,
    )
    if image_bytes:
        log.input_image.save(image_name, ContentFile(image_bytes), save=False)
    log.save()

    land = None
    if land_id:
        land = Land.objects.filter(pk=land_id, owner=user).select_related("cell").first()

    issue = None
    escalation_error = None
    if auto_escalate and diagnosis.should_escalate:
        try:
            issue = decide_and_escalate(
                farmer=user,
                diagnosis=diagnosis,
                ai_query=log,
                land=land,
            )
        except EscalationError as exc:
            escalation_error = str(exc)
            logger.warning("Auto-escalation skipped: %s", exc)

    return {
        "diagnosis_id": log.pk,
        "diagnosis": diagnosis.to_dict(),
        "escalated": bool(issue),
        "issue_id": issue.pk if issue else None,
        "escalation_error": escalation_error,
    }


def escalate_diagnosis(
    *,
    user,
    diagnosis_id: int,
    land_id: int | None = None,
) -> dict[str, Any]:
    log = AIQueryLog.objects.filter(pk=diagnosis_id, user=user).first()
    if not log:
        raise ValueError("Diagnosis not found.")
    if log.was_escalated:
        existing = log.escalations.order_by("-created_at").first()
        return {
            "escalated": True,
            "issue_id": existing.pk if existing else None,
            "already_escalated": True,
        }

    data = log.structured_response or {}
    diagnosis = CropDiagnosisResult(
        crop=str(data.get("crop") or "Unknown"),
        problem=str(data.get("problem") or "Undetermined"),
        confidence=float(log.confidence_score or data.get("confidence") or 0.5),
        severity=str(data.get("severity") or log.severity or "medium"),  # type: ignore[arg-type]
        evidence=list(data.get("evidence") or []),
        recommendation=str(data.get("recommendation") or log.response_text or ""),
        explanation=str(data.get("explanation") or ""),
        reasoning_steps=list(data.get("reasoning_steps") or []),
        language=str(data.get("language") or log.language or "en"),  # type: ignore[arg-type]
        should_escalate=True,
        escalation_reason=str(data.get("escalation_reason") or "Farmer requested expert help"),
    )

    land = None
    if land_id:
        land = Land.objects.filter(pk=land_id, owner=user).select_related("cell").first()

    issue = decide_and_escalate(
        farmer=user,
        diagnosis=diagnosis,
        ai_query=log,
        land=land,
        force=True,
    )
    return {"escalated": True, "issue_id": issue.pk if issue else None, "already_escalated": False}


def transcribe_audio(
    *,
    audio_bytes: bytes,
    audio_mime_type: str = "audio/webm",
    language: Language = "rw",
) -> str:
    model = resolve_model(AITask.VOICE_TRANSCRIBE)
    lang_name = "Kinyarwanda" if language == "rw" else "English"
    prompt = (
        f"Transcribe this farmer's spoken audio accurately into {lang_name} text. "
        "Return ONLY the transcript, no commentary."
    )
    return generate_content(
        model,
        prompt,
        audio_bytes=audio_bytes,
        audio_mime_type=audio_mime_type,
    ).strip()


def chat_reply(
    *,
    text: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
    language: Language = "en",
) -> str:
    """Used by the legacy messaging AI channel."""
    if image_bytes:
        result = run_crop_health_agent(
            text=text,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
            language=language,
        )
        return result.explanation or result.recommendation

    model = resolve_model(AITask.GENERAL_QA)
    lang = "Kinyarwanda" if language == "rw" else "English"
    prompt = f"Reply in {lang}. Farmer question: {text}"
    return generate_content(model, prompt)


def run_field_scan(
    *,
    user,
    text: str = "",
    video_bytes: bytes | None = None,
    video_mime_type: str | None = None,
    frame_images: list[tuple[bytes, str]] | None = None,
    language: Language = "en",
    nano_hint: dict | None = None,
) -> dict[str, Any]:
    """Field walk video intelligence (Gemini frames/video)."""
    from ai.agents.field_scan import run_field_scan_agent

    if not video_bytes and not frame_images:
        raise ValueError("Provide a field video or sampled frames.")

    # Phone videos are large — frames-first is the production path.
    report = run_field_scan_agent(
        text=text,
        video_bytes=video_bytes,
        video_mime_type=video_mime_type,
        frame_images=frame_images,
        language=language,
        nano_hint=nano_hint,
    )

    model = resolve_model(AITask.FIELD_VIDEO)
    log = AIQueryLog.objects.create(
        user=user,
        query_type=AIQueryLog.QUERY_CROP_DIAGNOSIS,
        model_used=model,
        input_text=text or "field video scan",
        response_text=report.get("summary") or report.get("recommendation") or "",
        confidence_score=report.get("confidence"),
        structured_response={**report, "kind": "field_scan"},
        severity=report.get("severity") or "",
        language=language,
    )
    return {"scan_id": log.pk, "report": report, "nano_verified": bool(nano_hint)}


def officer_priority_feed(*, officer, limit: int = 30) -> list[dict[str, Any]]:
    """Urgent AI-escalated cases for the officer command center."""
    from reports.models import FarmerIssue

    issues = (
        FarmerIssue.objects.filter(assigned_officer=officer, ai_query__isnull=False)
        .select_related("reporter", "land", "land__cell", "ai_query")
        .order_by("-created_at")[:limit]
    )

    feed = []
    for issue in issues:
        structured = (issue.ai_query.structured_response if issue.ai_query else None) or {}
        severity = structured.get("severity") or (issue.ai_query.severity if issue.ai_query else "medium")
        confidence = structured.get("confidence")
        if confidence is None and issue.ai_query:
            confidence = issue.ai_query.confidence_score
        cell_name = ""
        if issue.land and issue.land.cell_id:
            cell_name = getattr(issue.land.cell, "name", "") or str(issue.land.cell_id)

        feed.append({
            "issue_id": issue.pk,
            "status": issue.status,
            "urgent": severity == "high" or bool(structured.get("kind") == "field_scan" and severity != "low"),
            "problem": structured.get("problem") or issue.description[:120],
            "crop": structured.get("crop") or "",
            "severity": severity,
            "confidence": confidence,
            "recommendation": structured.get("recommendation") or "",
            "escalation_reason": structured.get("escalation_reason") or "",
            "farmer": {
                "name": issue.reporter.full_name,
                "phone": issue.reporter.phone_number,
                "public_id": str(issue.reporter.public_id),
            },
            "location": cell_name,
            "created_at": issue.created_at.isoformat(),
            "recommended_action": (
                "Field inspection required."
                if severity == "high"
                else "Follow up with the farmer."
            ),
        })
    return feed


__all__ = [
    "GeminiError",
    "EscalationError",
    "run_crop_diagnosis",
    "run_field_scan",
    "escalate_diagnosis",
    "transcribe_audio",
    "chat_reply",
    "officer_priority_feed",
]

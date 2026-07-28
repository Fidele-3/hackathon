"""Crop Health Agent — multimodal diagnosis for Rwanda crops."""

from __future__ import annotations

from ai.gemini_client import GeminiError, extract_json, generate_content
from ai.model_router import AITask, resolve_model
from ai.schemas import (
    REASONING_STEPS_DEFAULT,
    REASONING_STEPS_RW,
    CropDiagnosisResult,
    Language,
    diagnosis_json_schema_hint,
)


def _language_instruction(language: Language) -> str:
    if language == "rw":
        return (
            "Write crop, problem, evidence, recommendation, explanation, and "
            "escalation_reason in Kinyarwanda (Ikinyarwanda). Keep JSON keys in English."
        )
    return "Write all human-readable string values in clear, simple English."


def run_crop_health_agent(
    *,
    text: str,
    image_bytes: bytes | None,
    image_mime_type: str | None,
    language: Language = "en",
) -> CropDiagnosisResult:
    model = resolve_model(AITask.CROP_DIAGNOSIS)
    prompt = (
        "Analyze this farm photo / description for crop health problems.\n"
        f"{_language_instruction(language)}\n\n"
        f"Farmer message: {text or '(no text — diagnose from image only)'}\n\n"
        f"{diagnosis_json_schema_hint()}"
    )

    raw = generate_content(
        model,
        prompt,
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
    )
    try:
        data = extract_json(raw)
    except GeminiError:
        return CropDiagnosisResult(
            crop="Unknown",
            problem="Needs review",
            confidence=0.4,
            severity="medium",
            evidence=[],
            recommendation=raw[:800],
            explanation=raw[:800],
            reasoning_steps=REASONING_STEPS_RW if language == "rw" else REASONING_STEPS_DEFAULT,
            language=language,
            should_escalate=False,
            raw_text=raw,
        )

    confidence = float(data.get("confidence") or 0.5)
    confidence = max(0.0, min(1.0, confidence))
    severity = str(data.get("severity") or "medium").lower()
    if severity not in ("high", "medium", "low"):
        severity = "medium"

    should_escalate = bool(data.get("should_escalate"))
    if severity == "high" and confidence >= 0.85:
        should_escalate = True

    steps = REASONING_STEPS_RW if language == "rw" else REASONING_STEPS_DEFAULT

    return CropDiagnosisResult(
        crop=str(data.get("crop") or "Unknown"),
        problem=str(data.get("problem") or "Undetermined"),
        confidence=confidence,
        severity=severity,  # type: ignore[arg-type]
        evidence=[str(e) for e in (data.get("evidence") or [])][:8],
        recommendation=str(data.get("recommendation") or ""),
        explanation=str(data.get("explanation") or data.get("recommendation") or ""),
        reasoning_steps=steps,
        language=language,
        should_escalate=should_escalate,
        escalation_reason=str(data.get("escalation_reason") or ""),
        raw_text=raw,
    )

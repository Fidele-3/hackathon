"""Field video intelligence — Gemini multimodal video/frames + structured map."""

from __future__ import annotations

import logging

from ai.gemini_client import GeminiError, extract_json, generate_content
from ai.model_router import AITask, resolve_model
from ai.schemas import Language

logger = logging.getLogger(__name__)

FIELD_SYSTEM = (
    "You are e-Hinga Field Intelligence for Rwanda farms. "
    "Analyze farm walk videos or frame sequences to locate crops, estimate affected area, "
    "and recommend targeted treatment. Be concrete and farmer-friendly. "
    "Never invent precise GPS; use relative field directions (north, south, northeast corner, etc.). "
    "When multiple frames are provided, treat them as a walk across the same field over time."
)


def run_field_scan_agent(
    *,
    text: str,
    video_bytes: bytes | None,
    video_mime_type: str | None,
    frame_images: list[tuple[bytes, str]] | None,
    language: Language = "en",
    nano_hint: dict | None = None,
) -> dict:
    model = resolve_model(AITask.FIELD_VIDEO)
    lang = (
        "Write human-readable string values in Kinyarwanda. Keep JSON keys in English."
        if language == "rw"
        else "Write human-readable string values in clear English."
    )
    nano_note = ""
    if nano_hint:
        nano_note = (
            f"\nOn-device Nano Banana pre-scan hint (verify/correct this): "
            f"{nano_hint}\n"
        )

    prompt = (
        "Analyze this farm field video / frames from a Rwandan smallholder. "
        "Locate crops, disease, and where problems concentrate.\n"
        f"{lang}\n{nano_note}\n"
        f"Farmer note: {text or '(none)'}\n\n"
        "Respond with ONLY valid JSON:\n"
        "{\n"
        '  "crop": string,\n'
        '  "problem": string,\n'
        '  "confidence": number 0-1,\n'
        '  "severity": "high"|"medium"|"low",\n'
        '  "area_affected_pct": number 0-100,\n'
        '  "disease_spreading": string,\n'
        '  "hotspots": [{"label": string, "x": number 0-1, "y": number 0-1, "intensity": number 0-1}],\n'
        '  "crops_located": [{"name": string, "location": string, "health": "healthy"|"stressed"|"diseased"}],\n'
        '  "recommendation": string,\n'
        '  "summary": string\n'
        "}\n"
        "hotspots x/y are relative positions on the field view (0=left/top, 1=right/bottom). "
        "If imagery is unclear, lower confidence and say so in summary — still return best estimate."
    )

    raw = None
    engine = "gemini-frames"
    errors: list[str] = []

    # Prefer multi-frame analysis for phone videos (reliable + fast).
    frames = list(frame_images or [])[:5]
    if frames:
        try:
            first, *rest = frames
            prompt2 = (
                prompt
                + f"\n({len(frames)} frames sampled evenly from a phone field-walk video.)"
            )
            raw = generate_content(
                model,
                prompt2,
                image_bytes=first[0],
                image_mime_type=first[1],
                extra_images=rest,
                system_instruction=FIELD_SYSTEM,
                timeout=90,
            )
            engine = "gemini-frames"
        except Exception as exc:
            errors.append(f"frames:{exc}")
            logger.warning("Frame analysis failed: %s", exc)

    # Optional short video pass (small files only)
    if raw is None and video_bytes and len(video_bytes) < 10_000_000:
        try:
            mime = video_mime_type or "video/mp4"
            if "quicktime" in mime:
                mime = "video/mp4"
            raw = generate_content(
                model,
                prompt,
                video_bytes=video_bytes,
                video_mime_type=mime,
                system_instruction=FIELD_SYSTEM,
                timeout=120,
            )
            engine = "gemini-video"
        except Exception as exc:
            errors.append(f"video:{exc}")
            logger.warning("Video analysis failed: %s", exc)

    if raw is None:
        raise GeminiError(
            "Could not analyze field media. "
            + ("; ".join(errors) if errors else "No usable video/frames.")
        )

    try:
        data = extract_json(raw)
    except GeminiError:
        # Soft parse failure — wrap narrative so UI still works
        data = {
            "crop": "Unknown",
            "problem": "Needs visual review",
            "confidence": 0.45,
            "severity": "medium",
            "area_affected_pct": 15,
            "disease_spreading": "Unclear from available frames",
            "hotspots": [{"label": "Review zone", "x": 0.5, "y": 0.5, "intensity": 0.4}],
            "crops_located": [{"name": "Crop", "location": "Main plot", "health": "stressed"}],
            "recommendation": raw[:500],
            "summary": raw[:500],
        }

    conf = float(data.get("confidence") or 0.7)
    conf = max(0.0, min(1.0, conf))
    area = float(data.get("area_affected_pct") or 0)
    area = max(0.0, min(100.0, area))
    severity = str(data.get("severity") or "medium").lower()
    if severity not in ("high", "medium", "low"):
        severity = "medium"

    hotspots = []
    for h in data.get("hotspots") or []:
        try:
            hotspots.append({
                "label": str(h.get("label") or "Hotspot"),
                "x": max(0.0, min(1.0, float(h.get("x", 0.5)))),
                "y": max(0.0, min(1.0, float(h.get("y", 0.5)))),
                "intensity": max(0.0, min(1.0, float(h.get("intensity", 0.5)))),
            })
        except (TypeError, ValueError):
            continue
    if not hotspots:
        hotspots = [{"label": "Field center", "x": 0.5, "y": 0.5, "intensity": 0.4}]

    crops = []
    for c in data.get("crops_located") or []:
        crops.append({
            "name": str(c.get("name") or "Crop"),
            "location": str(c.get("location") or ""),
            "health": str(c.get("health") or "stressed"),
        })
    if not crops:
        crops = [{"name": str(data.get("crop") or "Crop"), "location": "Main plot", "health": "stressed"}]

    return {
        "crop": str(data.get("crop") or "Unknown"),
        "problem": str(data.get("problem") or "Field stress"),
        "confidence": conf,
        "severity": severity,
        "area_affected_pct": round(area, 1),
        "disease_spreading": str(data.get("disease_spreading") or ""),
        "hotspots": hotspots[:8],
        "crops_located": crops[:8],
        "recommendation": str(data.get("recommendation") or ""),
        "summary": str(data.get("summary") or ""),
        "language": language,
        "engine": engine,
    }

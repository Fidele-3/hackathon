"""Shared response contracts for e-Hinga AI orchestration."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

Severity = Literal["high", "medium", "low"]
Language = Literal["en", "rw"]


REASONING_STEPS_DEFAULT = [
    "Image received",
    "Plant patterns detected",
    "Disease database compared",
    "Environmental factors considered",
]

REASONING_STEPS_RW = [
    "Ifoto yakiriwe",
    "Ibimenyetso by'ibihingwa byabonetse",
    "Byagereranyijwe n'indwara zizwi",
    "Ibintu by'ikirere byafasweho",
]


@dataclass
class CropDiagnosisResult:
    crop: str
    problem: str
    confidence: float
    severity: Severity
    evidence: list[str]
    recommendation: str
    reasoning_steps: list[str] = field(default_factory=lambda: list(REASONING_STEPS_DEFAULT))
    language: Language = "en"
    should_escalate: bool = False
    escalation_reason: str = ""
    explanation: str = ""
    raw_text: str = ""

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["confidence"] = round(float(self.confidence), 4)
        return data


def diagnosis_json_schema_hint() -> str:
    return (
        "Respond with ONLY valid JSON (no markdown fences) matching this schema:\n"
        "{\n"
        '  "crop": string,\n'
        '  "problem": string,\n'
        '  "confidence": number between 0 and 1,\n'
        '  "severity": "high" | "medium" | "low",\n'
        '  "evidence": string[],\n'
        '  "recommendation": string,\n'
        '  "explanation": string,\n'
        '  "should_escalate": boolean,\n'
        '  "escalation_reason": string\n'
        "}\n"
        "If unsure, lower confidence and say so in explanation. "
        "Set should_escalate true when severity is high or livestock/crop risk "
        "threatens food security or rapid spread."
    )

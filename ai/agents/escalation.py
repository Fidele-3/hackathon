"""Expert Escalation Agent — routes severe AI diagnoses to cell officers."""

from __future__ import annotations

import logging

from django.db import transaction

from ai.models import AIQueryLog
from ai.schemas import CropDiagnosisResult
from notifications.models import Notification
from production.models import Land
from reports.models import Conversation, FarmerIssue
from reports.routing import find_cell_officer

logger = logging.getLogger(__name__)


class EscalationError(Exception):
    pass


def decide_and_escalate(
    *,
    farmer,
    diagnosis: CropDiagnosisResult,
    ai_query: AIQueryLog,
    land: Land | None = None,
    force: bool = False,
) -> FarmerIssue | None:
    """Create a FarmerIssue + officer conversation when severity warrants it.

    Returns the issue if escalated, else None.
    """
    if not force and not diagnosis.should_escalate:
        return None

    if land is None:
        land = (
            Land.objects.filter(owner=farmer)
            .select_related("cell")
            .order_by("-registered_at")
            .first()
        )
    if land is None:
        raise EscalationError(
            "No land registered for this farmer — cannot route to a cell officer."
        )

    officer_profile = find_cell_officer(land.cell, FarmerIssue.CATEGORY_CROP)
    if not officer_profile:
        raise EscalationError(
            "No agronomist is currently assigned to this farmer's cell."
        )

    description = (
        f"AI Crop Doctor alert\n"
        f"Crop: {diagnosis.crop}\n"
        f"Problem: {diagnosis.problem}\n"
        f"Severity: {diagnosis.severity}\n"
        f"Confidence: {diagnosis.confidence:.0%}\n"
        f"Evidence: {', '.join(diagnosis.evidence) or 'n/a'}\n"
        f"Recommendation: {diagnosis.recommendation}\n"
        f"Reason: {diagnosis.escalation_reason or 'High-severity diagnosis'}"
    )

    with transaction.atomic():
        issue = FarmerIssue.objects.create(
            reporter=farmer,
            category=FarmerIssue.CATEGORY_CROP,
            land=land,
            ai_query=ai_query,
            description=description,
            status=FarmerIssue.STATUS_ASSIGNED,
            assigned_officer=officer_profile.user,
        )
        ai_query.was_escalated = True
        ai_query.save(update_fields=["was_escalated"])

        officer_conversation, _ = Conversation.objects.get_or_create(
            farmer=farmer,
            channel=Conversation.CHANNEL_OFFICER,
            officer=officer_profile.user,
            defaults={"related_issue": issue},
        )
        if officer_conversation.related_issue_id is None:
            officer_conversation.related_issue = issue
            officer_conversation.save(update_fields=["related_issue"])

        Notification.objects.create(
            recipient=officer_profile.user,
            notification_type=Notification.TYPE_ISSUE_ASSIGNED,
            title="URGENT AI ALERT",
            message=(
                f"{diagnosis.problem} — {farmer.full_name} "
                f"({getattr(land.cell, 'name', 'cell')}). "
                f"Confidence {diagnosis.confidence:.0%}."
            ),
            related_issue=issue,
        )

    logger.info("Escalated AI query %s to issue %s", ai_query.pk, issue.pk)
    return issue

from django.db.models import Count, Sum

from ai.gemini_client import INSIGHT_MODEL, generate_content
from ai.models import Insight


def _harvest_breakdown(date, district=None):
    from production.models import HarvestReport

    qs = HarvestReport.objects.filter(created_at__date=date)
    if district:
        qs = qs.filter(land__cell__sector__district=district)
    return list(qs.values("crop__name").annotate(total_kg=Sum("quantity_kg"), reports=Count("id")))


def _livestock_breakdown(date, district=None):
    from production.models import LivestockProduction

    qs = LivestockProduction.objects.filter(created_at__date=date)
    if district:
        qs = qs.filter(livestock_location__cell__sector__district=district)
    return list(qs.values("product_type").annotate(total=Sum("quantity"), reports=Count("id")))


def _resource_request_breakdown(date, district=None):
    from production.models import ResourceRequest

    qs = ResourceRequest.objects.filter(requested_at__date=date)
    if district:
        qs = qs.filter(land__cell__sector__district=district) | qs.filter(
            livestock_location__cell__sector__district=district
        )
    return list(qs.values("resource_type", "status").annotate(count=Count("id")))


def _storage_request_breakdown(date, district=None):
    from production.models import StorageRequest

    qs = StorageRequest.objects.filter(requested_at__date=date)
    if district:
        qs = qs.filter(harvest_report__land__cell__sector__district=district)
    return list(qs.values("status").annotate(count=Count("id"), total_kg=Sum("quantity_kg")))


def _issue_breakdown(date, district=None):
    from reports.models import FarmerIssue

    qs = FarmerIssue.objects.filter(created_at__date=date)
    if district:
        qs = qs.filter(land__cell__sector__district=district) | qs.filter(
            livestock_location__cell__sector__district=district
        )
    return list(qs.values("category", "status").annotate(count=Count("id")))


def gather_snapshot(date, district=None):
    return {
        "harvests": _harvest_breakdown(date, district),
        "livestock_production": _livestock_breakdown(date, district),
        "resource_requests": _resource_request_breakdown(date, district),
        "storage_requests": _storage_request_breakdown(date, district),
        "farmer_issues": _issue_breakdown(date, district),
    }


def _format_snapshot_text(snapshot, date, district):
    scope_label = district.name if district else "Rwanda (national)"
    lines = [f"Real platform activity for {scope_label} on {date}:"]

    lines.append(f"Harvest reports: {snapshot['harvests'] or 'none recorded'}")
    lines.append(f"Livestock production reports: {snapshot['livestock_production'] or 'none recorded'}")
    lines.append(f"Resource requests (fertilizer/seed/medicine/feed): {snapshot['resource_requests'] or 'none recorded'}")
    lines.append(f"Storage requests: {snapshot['storage_requests'] or 'none recorded'}")
    lines.append(f"Farmer-reported issues: {snapshot['farmer_issues'] or 'none recorded'}")
    return "\n".join(lines)


def generate_insight(date, district=None):
    snapshot = gather_snapshot(date, district)
    data_text = _format_snapshot_text(snapshot, date, district)

    prompt = (
        f"{data_text}\n\n"
        "Write a concise executive summary (3-5 sentences) for an agriculture official, "
        "highlighting the most important trends, problems, or anomalies in the data above. "
        "Only reference numbers that appear in the data -- never invent statistics. If there "
        "is too little data to draw a real conclusion, say so plainly instead of padding."
    )
    content = generate_content(INSIGHT_MODEL, prompt)

    insight, _ = Insight.objects.update_or_create(
        scope=Insight.SCOPE_DISTRICT if district else Insight.SCOPE_NATIONAL,
        district=district,
        summary_date=date,
        defaults={"content": content, "model_used": INSIGHT_MODEL},
    )
    return insight

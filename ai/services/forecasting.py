from django.db.models import Count, Sum

from ai.gemini_client import INSIGHT_MODEL, generate_content


def _historical_same_season(district, crop, season, current_year):
    from production.models import HarvestReport

    return list(
        HarvestReport.objects.filter(crop=crop, season=season, land__cell__sector__district=district)
        .exclude(season_year=current_year)
        .values("season_year")
        .annotate(total_kg=Sum("quantity_kg"), reports=Count("id"))
        .order_by("season_year")
    )


def _current_season_so_far(district, crop, season, current_year):
    from production.models import HarvestReport

    agg = HarvestReport.objects.filter(
        crop=crop, season=season, season_year=current_year, land__cell__sector__district=district
    ).aggregate(total_kg=Sum("quantity_kg"), reports=Count("id"))
    return {"total_kg": agg["total_kg"] or 0, "reports": agg["reports"] or 0}


def _recent_climate(district):
    from production.models import CellClimateData

    summary = []
    for record in CellClimateData.objects.filter(cell__sector__district=district, past_3_months_data__isnull=False):
        daily = record.past_3_months_data.get("daily", {})
        max_temps = [t for t in daily.get("temperature_2m_max", []) if t is not None]
        precip = [p for p in daily.get("precipitation_sum", []) if p is not None]
        if not max_temps:
            continue
        summary.append({
            "cell": record.cell.name,
            "avg_max_temp_c": round(sum(max_temps) / len(max_temps), 1),
            "total_precip_mm_90d": round(sum(precip), 1),
        })
    return summary


def gather_forecast_snapshot(district, crop, season, current_year):
    return {
        "season": season,
        "season_year": current_year,
        "current_season_so_far": _current_season_so_far(district, crop, season, current_year),
        "historical_same_season": _historical_same_season(district, crop, season, current_year),
        "recent_climate": _recent_climate(district),
    }


def generate_forecast(district, crop, season, current_year):
    snapshot = gather_forecast_snapshot(district, crop, season, current_year)

    data_text = (
        f"Real data for {district.name} district, crop: {crop.name}, Season {season} {current_year}:\n"
        f"This season so far: {snapshot['current_season_so_far']}\n"
        f"Historical totals for this SAME season label in prior years: {snapshot['historical_same_season'] or 'none recorded'}\n"
        f"Recent climate (last 90 days) by cell: {snapshot['recent_climate'] or 'none recorded'}\n"
    )
    prompt = (
        f"{data_text}\n\n"
        "Based ONLY on the data above, forecast whether this season's harvest for this crop in this "
        "district is likely to be above, below, or in line with the historical same-season average, and "
        "explain why using the climate data if relevant. If there are fewer than 2 prior years of data to "
        "compare against, say plainly that there isn't enough history for a real forecast yet, rather than "
        "guessing. Keep it to 3-4 sentences."
    )
    return generate_content(INSIGHT_MODEL, prompt)

import logging
from datetime import date, timedelta

import requests
from celery import shared_task
from django.db.models import Q
from django.utils import timezone

logger = logging.getLogger(__name__)

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


def _cells_with_activity():
    from users.models import Cell

    return Cell.objects.filter(
        Q(lands__isnull=False) | Q(livestock_locations__isnull=False), latitude__isnull=False, longitude__isnull=False
    ).distinct()


@shared_task(bind=True, max_retries=3)
def fetch_24h_forecast_task(self):
    from production.models import CellClimateData

    cells = _cells_with_activity()
    for cell in cells:
        try:
            resp = requests.get(
                OPEN_METEO_FORECAST_URL,
                params={
                    "latitude": cell.latitude, "longitude": cell.longitude,
                    "hourly": "temperature_2m,precipitation", "forecast_days": 1, "timezone": "auto",
                },
                timeout=15,
            )
            resp.raise_for_status()
            CellClimateData.objects.update_or_create(
                cell=cell, defaults={"next_24h_forecast": resp.json(), "forecast_fetched_at": timezone.now()}
            )
        except requests.RequestException:
            logger.exception("Forecast fetch failed for cell %s", cell.id)
    logger.info("Fetched 24h forecast for %s cells with activity.", cells.count())


@shared_task(bind=True, max_retries=2)
def fetch_past_3months_task(self):
    from production.models import CellClimateData

    today = date.today()
    start_date = today - timedelta(days=90)
    cells = _cells_with_activity()
    for cell in cells:
        try:
            resp = requests.get(
                OPEN_METEO_ARCHIVE_URL,
                params={
                    "latitude": cell.latitude, "longitude": cell.longitude,
                    "start_date": start_date.isoformat(), "end_date": today.isoformat(),
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum", "timezone": "auto",
                },
                timeout=20,
            )
            resp.raise_for_status()
            CellClimateData.objects.update_or_create(
                cell=cell, defaults={"past_3_months_data": resp.json(), "historical_fetched_at": timezone.now()}
            )
        except requests.RequestException:
            logger.exception("Historical fetch failed for cell %s", cell.id)
    logger.info("Fetched 90-day history for %s cells with activity.", cells.count())

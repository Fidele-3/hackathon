import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task
def generate_daily_insights_task():
    from ai.services.insight_generation import generate_insight
    from users.models import District

    today = timezone.now().date()
    generate_insight(today, district=None)
    for district in District.objects.all():
        generate_insight(today, district=district)
    logger.info("Generated daily insights for %s districts + national.", District.objects.count())

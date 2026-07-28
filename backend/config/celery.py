import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("ubuhinzi")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "generate_daily_insights": {
        "task": "ai.tasks.generate_daily_insights_task",
        "schedule": crontab(hour=22, minute=0),
    },
    "fetch_24h_forecast_hourly": {
        "task": "production.tasks.fetch_24h_forecast_task",
        "schedule": crontab(minute=0),
    },
    "fetch_past_3months_weekly": {
        "task": "production.tasks.fetch_past_3months_task",
        "schedule": crontab(minute=0, hour=1, day_of_week="mon"),
    },
}

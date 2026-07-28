from django.contrib import admin

from .models import AIQueryLog, Insight


@admin.register(AIQueryLog)
class AIQueryLogAdmin(admin.ModelAdmin):
    list_display = ("id", "query_type", "model_used", "user", "was_escalated", "created_at")
    list_filter = ("query_type", "model_used", "was_escalated")


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ("scope", "district", "summary_date", "model_used", "generated_at")
    list_filter = ("scope", "summary_date")

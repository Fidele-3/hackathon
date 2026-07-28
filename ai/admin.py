from django.contrib import admin

from .models import AIQueryLog


@admin.register(AIQueryLog)
class AIQueryLogAdmin(admin.ModelAdmin):
    list_display = ("id", "query_type", "model_used", "user", "was_escalated", "created_at")
    list_filter = ("query_type", "model_used", "was_escalated")

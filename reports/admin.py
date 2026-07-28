from django.contrib import admin

from .models import FarmerIssue


@admin.register(FarmerIssue)
class FarmerIssueAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "status", "reporter", "assigned_officer", "created_at")
    list_filter = ("category", "status")

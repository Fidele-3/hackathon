from django.contrib import admin

from .models import Conversation, FarmerIssue, Message, MessageAttachment


@admin.register(FarmerIssue)
class FarmerIssueAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "status", "reporter", "assigned_officer", "created_at")
    list_filter = ("category", "status")


admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(MessageAttachment)

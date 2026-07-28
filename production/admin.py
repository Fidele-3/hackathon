from django.contrib import admin

from .models import (
    Crop, Fertilizer, HarvestReport, Land, LivestockLocation,
    LivestockProduction, LivestockType, ResourceRequest,
)

admin.site.register(Crop)
admin.site.register(LivestockType)
admin.site.register(Fertilizer)
admin.site.register(Land)
admin.site.register(LivestockLocation)
admin.site.register(HarvestReport)
admin.site.register(LivestockProduction)


@admin.register(ResourceRequest)
class ResourceRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "resource_type", "status", "farmer", "assigned_officer", "requested_at")
    list_filter = ("resource_type", "status")

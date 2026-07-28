from django.contrib import admin

from .models import (
    Crop, Fertilizer, HarvestListing, HarvestReport, Land, LivestockLocation,
    LivestockProduction, LivestockType, ResourceRequest, StorageRequest,
    Warehouse, WarehouseCapacity,
)

admin.site.register(Crop)
admin.site.register(LivestockType)
admin.site.register(Fertilizer)
admin.site.register(Land)
admin.site.register(LivestockLocation)
admin.site.register(HarvestReport)
admin.site.register(LivestockProduction)
admin.site.register(WarehouseCapacity)


@admin.register(ResourceRequest)
class ResourceRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "resource_type", "status", "farmer", "assigned_officer", "requested_at")
    list_filter = ("resource_type", "status")


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("name", "cell", "is_active")


@admin.register(StorageRequest)
class StorageRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "warehouse", "quantity_kg", "status", "farmer", "requested_at")
    list_filter = ("status",)


@admin.register(HarvestListing)
class HarvestListingAdmin(admin.ModelAdmin):
    list_display = ("id", "farmer", "quantity_available_kg", "price_per_kg", "status")
    list_filter = ("status",)

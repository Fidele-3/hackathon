from django.contrib import admin

from .models import BuyerProfile, Cell, District, OfficerProfile, Province, Sector, User, Village


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone_number", "email", "full_name", "national_id", "user_level", "is_active")
    list_filter = ("user_level", "is_active")
    search_fields = ("phone_number", "email", "national_id", "full_name")
    ordering = ("-date_joined",)
    exclude = ("password",)


@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "specialization", "managed_district", "managed_sector", "managed_cell", "is_active")
    list_filter = ("level", "specialization", "is_active")


@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "payment_method", "is_verified")
    list_filter = ("is_verified", "payment_method")


admin.site.register(Province)
admin.site.register(District)
admin.site.register(Sector)
admin.site.register(Cell)
admin.site.register(Village)

from django.contrib import admin

from .models import Cell, District, OfficerProfile, Province, Sector, User, Village


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone_number", "email", "full_name", "national_id", "user_level", "is_active")
    list_filter = ("user_level", "is_active")
    search_fields = ("phone_number", "email", "national_id", "full_name")
    ordering = ("-date_joined",)
    exclude = ("password",)


@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "specialization", "managed_district", "managed_cell", "is_active")
    list_filter = ("level", "specialization", "is_active")


admin.site.register(Province)
admin.site.register(District)
admin.site.register(Sector)
admin.site.register(Cell)
admin.site.register(Village)

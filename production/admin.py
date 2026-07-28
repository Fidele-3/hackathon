from django.contrib import admin

from .models import Crop, Fertilizer, HarvestReport, Land, LivestockLocation, LivestockProduction, LivestockType

admin.site.register(Crop)
admin.site.register(LivestockType)
admin.site.register(Fertilizer)
admin.site.register(Land)
admin.site.register(LivestockLocation)
admin.site.register(HarvestReport)
admin.site.register(LivestockProduction)

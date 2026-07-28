from rest_framework import serializers

from production.models import HarvestListing


class ReserveListingSerializer(serializers.Serializer):
    def save(self):
        listing = self.context["listing"]
        listing.status = HarvestListing.STATUS_RESERVED
        listing.reserved_by = self.context["request"].user
        listing.save(update_fields=["status", "reserved_by"])
        return listing

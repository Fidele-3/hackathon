from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import HarvestListing
from production.serializers.citizen.listing import HarvestListingSerializer


class HarvestListingListCreateView(generics.ListCreateAPIView):
    serializer_class = HarvestListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HarvestListing.objects.filter(farmer=self.request.user)

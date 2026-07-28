from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import LivestockLocation, LivestockProduction
from production.serializers.citizen.livestock import LivestockLocationSerializer, LivestockProductionSerializer


class LivestockLocationListCreateView(generics.ListCreateAPIView):
    serializer_class = LivestockLocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LivestockLocation.objects.filter(owner=self.request.user)


class LivestockProductionListCreateView(generics.ListCreateAPIView):
    serializer_class = LivestockProductionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LivestockProduction.objects.filter(livestock_location__owner=self.request.user)

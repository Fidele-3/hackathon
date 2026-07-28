from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import HarvestReport
from production.serializers.citizen.harvest import HarvestReportSerializer


class HarvestReportListCreateView(generics.ListCreateAPIView):
    serializer_class = HarvestReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HarvestReport.objects.filter(land__owner=self.request.user)

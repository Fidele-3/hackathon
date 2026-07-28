from rest_framework import generics

from production.models import HarvestReport, Land, LivestockLocation, LivestockProduction
from production.serializers.citizen.harvest import HarvestReportSerializer
from production.serializers.citizen.land import LandSerializer
from production.serializers.citizen.livestock import LivestockLocationSerializer, LivestockProductionSerializer
from users.permissions import IsOfficer
from users.scoping import officer_jurisdiction_filter


class OfficerLandListView(generics.ListAPIView):
    serializer_class = LandSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return Land.objects.filter(officer_jurisdiction_filter(self.request.user, "cell"))


class OfficerHarvestReportListView(generics.ListAPIView):
    serializer_class = HarvestReportSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return HarvestReport.objects.filter(officer_jurisdiction_filter(self.request.user, "land__cell"))


class OfficerLivestockLocationListView(generics.ListAPIView):
    serializer_class = LivestockLocationSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return LivestockLocation.objects.filter(officer_jurisdiction_filter(self.request.user, "cell"))


class OfficerLivestockProductionListView(generics.ListAPIView):
    serializer_class = LivestockProductionSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return LivestockProduction.objects.filter(
            officer_jurisdiction_filter(self.request.user, "livestock_location__cell")
        )

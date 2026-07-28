from rest_framework import generics, status
from rest_framework.response import Response

from users.models import OfficerProfile
from users.permissions import IsDistrictOfficer
from users.serializers.common.profile import MeSerializer, OfficerRosterSerializer
from users.serializers.district.officers import CreateSectorOfficerSerializer


class CreateSectorOfficerView(generics.CreateAPIView):
    serializer_class = CreateSectorOfficerSerializer
    permission_classes = [IsDistrictOfficer]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": MeSerializer(user).data,
                "temporary_password": user.generated_password,
            },
            status=status.HTTP_201_CREATED,
        )


class SectorOfficerListView(generics.ListAPIView):
    serializer_class = OfficerRosterSerializer
    permission_classes = [IsDistrictOfficer]

    def get_queryset(self):
        managed_district = self.request.user.officer_profile.managed_district
        return OfficerProfile.objects.filter(
            level=OfficerProfile.LEVEL_SECTOR, managed_sector__district=managed_district
        ).select_related("user", "managed_sector")

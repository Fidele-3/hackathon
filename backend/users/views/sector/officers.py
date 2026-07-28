from rest_framework import generics, status
from rest_framework.response import Response

from users.models import OfficerProfile
from users.permissions import IsSectorOfficer
from users.serializers.common.profile import MeSerializer, OfficerRosterSerializer
from users.serializers.sector.officers import CreateCellOfficerSerializer


class CreateCellOfficerView(generics.CreateAPIView):
    serializer_class = CreateCellOfficerSerializer
    permission_classes = [IsSectorOfficer]

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


class CellOfficerListView(generics.ListAPIView):
    serializer_class = OfficerRosterSerializer
    permission_classes = [IsSectorOfficer]

    def get_queryset(self):
        managed_sector = self.request.user.officer_profile.managed_sector
        return OfficerProfile.objects.filter(
            level=OfficerProfile.LEVEL_CELL, managed_cell__sector=managed_sector
        ).select_related("user", "managed_cell")

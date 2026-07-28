from rest_framework import generics, status
from rest_framework.response import Response

from users.models import OfficerProfile
from users.permissions import IsNationalAdmin
from users.serializers.common.profile import MeSerializer, OfficerRosterSerializer
from users.serializers.national.officers import CreateDistrictOfficerSerializer


class CreateDistrictOfficerView(generics.CreateAPIView):
    serializer_class = CreateDistrictOfficerSerializer
    permission_classes = [IsNationalAdmin]

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


class DistrictOfficerListView(generics.ListAPIView):
    serializer_class = OfficerRosterSerializer
    permission_classes = [IsNationalAdmin]
    queryset = OfficerProfile.objects.filter(level=OfficerProfile.LEVEL_DISTRICT).select_related("user", "managed_district")

from rest_framework import generics, status
from rest_framework.response import Response

from users.permissions import IsSectorOfficer
from users.serializers.common.profile import MeSerializer
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

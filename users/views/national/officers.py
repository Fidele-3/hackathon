from rest_framework import generics, status
from rest_framework.response import Response

from users.permissions import IsNationalAdmin
from users.serializers.common.profile import MeSerializer
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

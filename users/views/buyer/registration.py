from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.serializers.buyer.registration import BuyerRegisterSerializer
from users.serializers.common.profile import MeSerializer


class BuyerRegisterView(generics.CreateAPIView):
    serializer_class = BuyerRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(MeSerializer(user).data, status=status.HTTP_201_CREATED)

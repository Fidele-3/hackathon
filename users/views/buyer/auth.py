from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from users.serializers.common.auth import LoginSerializer
from users.serializers.common.profile import MeSerializer
from users.utils import issue_tokens, resolve_and_authenticate


class BuyerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = resolve_and_authenticate(
            serializer.validated_data["identifier"],
            serializer.validated_data["password"],
            allowed_levels=[User.LEVEL_BUYER],
        )
        tokens = issue_tokens(user)
        return Response({**tokens, "user": MeSerializer(user).data}, status=status.HTTP_200_OK)

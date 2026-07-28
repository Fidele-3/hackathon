from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from users.serializers.common.auth import GoogleLoginSerializer, LoginSerializer
from users.serializers.common.profile import MeSerializer
from users.utils import issue_tokens, resolve_and_authenticate

OFFICER_LEVELS = [
    User.LEVEL_NATIONAL_ADMIN,
    User.LEVEL_DISTRICT_OFFICER,
    User.LEVEL_SECTOR_OFFICER,
    User.LEVEL_CELL_OFFICER,
]


class OfficerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = resolve_and_authenticate(
            serializer.validated_data["identifier"],
            serializer.validated_data["password"],
            allowed_levels=OFFICER_LEVELS,
        )
        tokens = issue_tokens(user)
        return Response(
            {**tokens, "user": MeSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            claims = google_id_token.verify_oauth2_token(
                serializer.validated_data["id_token"],
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except ValueError:
            raise AuthenticationFailed("Invalid Google token.")

        google_sub = claims["sub"]
        email = claims.get("email")

        user = User.objects.filter(google_sub=google_sub).first()
        if not user and email:
            user = User.objects.filter(email=email).first()
            if user:
                user.google_sub = google_sub
                user.save(update_fields=["google_sub"])

        if not user:
            phone_number = request.data.get("phone_number")
            national_id = request.data.get("national_id")
            missing = [f for f, v in [("phone_number", phone_number), ("national_id", national_id)] if not v]
            if missing:
                return Response(
                    {
                        "detail": "phone_number and national_id are required to complete Google sign-up.",
                        "missing_fields": missing,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.create_user(
                phone_number=phone_number,
                national_id=national_id,
                full_name=claims.get("name", ""),
                email=email,
                google_sub=google_sub,
                password=None,
            )

        tokens = issue_tokens(user)
        return Response(
            {**tokens, "user": MeSerializer(user).data},
            status=status.HTTP_200_OK,
        )

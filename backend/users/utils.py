from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def resolve_and_authenticate(identifier, password, allowed_levels):
    user = User.objects.filter(Q(phone_number=identifier) | Q(email=identifier)).first()
    if not user or not user.check_password(password):
        raise AuthenticationFailed("Invalid credentials.")
    if not user.is_active:
        raise PermissionDenied("Account disabled.")
    if user.user_level not in allowed_levels:
        raise PermissionDenied("This account type is not allowed to log in here.")
    return user

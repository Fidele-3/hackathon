from rest_framework.permissions import BasePermission

from .models import User


class IsNationalAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_level == User.LEVEL_NATIONAL_ADMIN)


class IsDistrictOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.user_level == User.LEVEL_DISTRICT_OFFICER)

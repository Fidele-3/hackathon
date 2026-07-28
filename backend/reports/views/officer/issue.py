from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from reports.models import FarmerIssue
from reports.serializers.common.issue import FarmerIssueSerializer
from reports.serializers.officer.issue import FarmerIssueResolveSerializer
from users.permissions import IsOfficer
from users.scoping import can_manage_category, officer_jurisdiction_filter


def _jurisdiction_queryset(user):
    land_jurisdiction = officer_jurisdiction_filter(user, "land__cell")
    livestock_jurisdiction = officer_jurisdiction_filter(user, "livestock_location__cell")
    return FarmerIssue.objects.filter(land_jurisdiction) | FarmerIssue.objects.filter(livestock_jurisdiction)


class OfficerFarmerIssueListView(generics.ListAPIView):
    serializer_class = FarmerIssueSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return _jurisdiction_queryset(self.request.user)


class FarmerIssueResolveView(generics.GenericAPIView):
    serializer_class = FarmerIssueResolveSerializer
    permission_classes = [IsOfficer]

    def patch(self, request, pk):
        instance = get_object_or_404(_jurisdiction_queryset(request.user), pk=pk)
        if not can_manage_category(request.user, instance.category):
            raise PermissionDenied(f"Only a {instance.category} specialist can resolve this issue.")

        serializer = self.get_serializer(instance=instance, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(FarmerIssueSerializer(updated).data)

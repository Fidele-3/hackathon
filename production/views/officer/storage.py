from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from production.models import StorageRequest
from production.serializers.citizen.storage import StorageRequestSerializer
from production.serializers.officer.storage import StorageRequestDecisionSerializer
from users.permissions import IsOfficer
from users.scoping import can_manage_category, officer_jurisdiction_filter


def _jurisdiction_queryset(user):
    return StorageRequest.objects.filter(officer_jurisdiction_filter(user, "harvest_report__land__cell"))


class OfficerStorageRequestListView(generics.ListAPIView):
    serializer_class = StorageRequestSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return _jurisdiction_queryset(self.request.user)


class StorageRequestDecisionView(generics.GenericAPIView):
    serializer_class = StorageRequestDecisionSerializer
    permission_classes = [IsOfficer]

    def patch(self, request, pk):
        instance = get_object_or_404(_jurisdiction_queryset(request.user), pk=pk)
        if not can_manage_category(request.user, "crop"):
            raise PermissionDenied("Only a crop specialist can decide storage requests.")

        serializer = self.get_serializer(instance=instance, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(StorageRequestSerializer(updated).data)

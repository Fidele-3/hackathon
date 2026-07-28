from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from production.models import ResourceRequest
from production.serializers.citizen.resource_request import ResourceRequestSerializer
from production.serializers.officer.resource_request import ResourceRequestDecisionSerializer
from users.permissions import IsOfficer
from users.scoping import can_manage_category, officer_jurisdiction_filter


def _jurisdiction_queryset(user):
    land_jurisdiction = officer_jurisdiction_filter(user, "land__cell")
    livestock_jurisdiction = officer_jurisdiction_filter(user, "livestock_location__cell")
    return ResourceRequest.objects.filter(land_jurisdiction) | ResourceRequest.objects.filter(livestock_jurisdiction)


class OfficerResourceRequestListView(generics.ListAPIView):
    serializer_class = ResourceRequestSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return _jurisdiction_queryset(self.request.user)


class ResourceRequestDecisionView(generics.GenericAPIView):
    serializer_class = ResourceRequestDecisionSerializer
    permission_classes = [IsOfficer]

    def patch(self, request, pk):
        # Jurisdiction is part of the lookup itself, not a check performed
        # after fetching by raw pk -- a request outside the officer's
        # territory 404s rather than being reachable at all.
        instance = get_object_or_404(_jurisdiction_queryset(request.user), pk=pk)
        if not can_manage_category(request.user, instance.category):
            raise PermissionDenied(f"Only a {instance.category} specialist can decide this request.")

        serializer = self.get_serializer(instance=instance, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(ResourceRequestSerializer(updated).data)

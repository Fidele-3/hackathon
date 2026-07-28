from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from production.models import ResourceRequest
from production.serializers.citizen.resource_request import ResourceRequestSerializer
from production.serializers.officer.resource_request import ResourceRequestDecisionSerializer
from users.permissions import IsOfficer
from users.scoping import can_manage_category, officer_jurisdiction_filter


class OfficerResourceRequestListView(generics.ListAPIView):
    serializer_class = ResourceRequestSerializer
    permission_classes = [IsOfficer]

    def get_queryset(self):
        user = self.request.user
        land_jurisdiction = officer_jurisdiction_filter(user, "land__cell")
        livestock_jurisdiction = officer_jurisdiction_filter(user, "livestock_location__cell")
        return ResourceRequest.objects.filter(land_jurisdiction) | ResourceRequest.objects.filter(
            livestock_jurisdiction
        )


class ResourceRequestDecisionView(generics.GenericAPIView):
    serializer_class = ResourceRequestDecisionSerializer
    permission_classes = [IsOfficer]

    def patch(self, request, pk):
        instance = get_object_or_404(ResourceRequest, pk=pk)
        if not can_manage_category(request.user, instance.category):
            raise PermissionDenied(f"Only a {instance.category} specialist can decide this request.")

        serializer = self.get_serializer(instance=instance, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(ResourceRequestSerializer(updated).data)

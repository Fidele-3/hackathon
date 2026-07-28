from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import ResourceRequest
from production.serializers.citizen.resource_request import ResourceRequestSerializer


class ResourceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResourceRequest.objects.filter(farmer=self.request.user)

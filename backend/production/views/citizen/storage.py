from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import StorageRequest
from production.serializers.citizen.storage import StorageRequestSerializer


class StorageRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = StorageRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StorageRequest.objects.filter(farmer=self.request.user)

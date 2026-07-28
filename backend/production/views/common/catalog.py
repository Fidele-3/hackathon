from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from production.models import Crop, Fertilizer, LivestockType
from production.serializers.common.catalog import CropSerializer, FertilizerSerializer, LivestockTypeSerializer


class CropListView(generics.ListAPIView):
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticated]
    queryset = Crop.objects.filter(is_active=True).order_by("name")
    pagination_class = None


class LivestockTypeListView(generics.ListAPIView):
    serializer_class = LivestockTypeSerializer
    permission_classes = [IsAuthenticated]
    queryset = LivestockType.objects.filter(is_active=True).order_by("name")
    pagination_class = None


class FertilizerListView(generics.ListAPIView):
    serializer_class = FertilizerSerializer
    permission_classes = [IsAuthenticated]
    queryset = Fertilizer.objects.filter(is_active=True).order_by("name")
    pagination_class = None

from rest_framework import generics
from rest_framework.permissions import AllowAny

from users.models import Cell, District, Province, Sector, Village
from users.serializers.common.locations import (
    CellSerializer,
    DistrictSerializer,
    ProvinceSerializer,
    SectorSerializer,
    VillageSerializer,
)


class ProvinceListView(generics.ListAPIView):
    serializer_class = ProvinceSerializer
    permission_classes = [AllowAny]
    queryset = Province.objects.all().order_by("name")
    pagination_class = None


class DistrictListView(generics.ListAPIView):
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = District.objects.all().order_by("name")
        province_id = self.request.query_params.get("province")
        if province_id:
            qs = qs.filter(province_id=province_id)
        return qs


class SectorListView(generics.ListAPIView):
    serializer_class = SectorSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Sector.objects.all().order_by("name")
        district_id = self.request.query_params.get("district")
        if district_id:
            qs = qs.filter(district_id=district_id)
        return qs


class CellListView(generics.ListAPIView):
    serializer_class = CellSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        sector_id = self.request.query_params.get("sector")
        if not sector_id:
            return Cell.objects.none()
        return Cell.objects.filter(sector_id=sector_id).order_by("name")


class VillageListView(generics.ListAPIView):
    serializer_class = VillageSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        cell_id = self.request.query_params.get("cell")
        if not cell_id:
            return Village.objects.none()
        return Village.objects.filter(cell_id=cell_id).order_by("name")

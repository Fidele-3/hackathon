from rest_framework import serializers

from users.models import Cell, District, Province, Sector, Village


class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ["id", "name", "latitude", "longitude"]


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ["id", "name", "latitude", "longitude", "province"]


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ["id", "name", "latitude", "longitude", "district"]


class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = ["id", "name", "latitude", "longitude", "sector"]


class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ["id", "name", "latitude", "longitude", "cell"]

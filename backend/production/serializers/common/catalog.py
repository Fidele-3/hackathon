from rest_framework import serializers

from production.models import Crop, Fertilizer, LivestockType


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ["id", "name", "local_name"]


class LivestockTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivestockType
        fields = ["id", "name", "local_name"]


class FertilizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fertilizer
        fields = ["id", "name", "fertilizer_type"]

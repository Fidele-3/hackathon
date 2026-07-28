from rest_framework import serializers

from production.models import Crop
from production.seasons import SEASON_CHOICES, get_current_season, get_current_season_year
from users.models import District


class ForecastQuerySerializer(serializers.Serializer):
    crop = serializers.PrimaryKeyRelatedField(queryset=Crop.objects.all())
    season = serializers.ChoiceField(choices=SEASON_CHOICES, required=False)
    season_year = serializers.IntegerField(required=False)

    def validate(self, attrs):
        attrs.setdefault("season", get_current_season())
        attrs.setdefault("season_year", get_current_season_year())
        return attrs


class NationalForecastQuerySerializer(ForecastQuerySerializer):
    district = serializers.PrimaryKeyRelatedField(queryset=District.objects.all())

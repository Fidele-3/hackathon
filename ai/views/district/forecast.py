from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.serializers.common.forecast import ForecastQuerySerializer
from ai.services.forecasting import generate_forecast
from users.permissions import IsDistrictOfficer


class DistrictForecastView(APIView):
    permission_classes = [IsDistrictOfficer]

    def get(self, request):
        district = request.user.officer_profile.managed_district
        if not district:
            raise PermissionDenied("No managed district on this account.")

        serializer = ForecastQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        content = generate_forecast(district, data["crop"], data["season"], data["season_year"])
        return Response({
            "district": district.name,
            "crop": data["crop"].name,
            "season": data["season"],
            "season_year": data["season_year"],
            "forecast": content,
        })

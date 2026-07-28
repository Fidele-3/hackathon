from rest_framework.response import Response
from rest_framework.views import APIView

from ai.serializers.common.forecast import NationalForecastQuerySerializer
from ai.services.forecasting import generate_forecast
from users.permissions import IsNationalAdmin


class NationalForecastView(APIView):
    permission_classes = [IsNationalAdmin]

    def get(self, request):
        serializer = NationalForecastQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        content = generate_forecast(data["district"], data["crop"], data["season"], data["season_year"])
        return Response({
            "district": data["district"].name,
            "crop": data["crop"].name,
            "season": data["season"],
            "season_year": data["season_year"],
            "forecast": content,
        })

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers.common.availability import AvailabilityCheckSerializer


class CheckAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = AvailabilityCheckSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return Response({
            "field": serializer.validated_data["field"],
            "value": serializer.validated_data["value"],
            "available": serializer.check_available(),
        })

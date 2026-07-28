from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.models import Insight
from ai.serializers.common.insight import InsightSerializer
from ai.services.insight_generation import generate_insight
from users.permissions import IsDistrictOfficer


class DistrictInsightView(APIView):
    permission_classes = [IsDistrictOfficer]

    def get(self, request):
        district = request.user.officer_profile.managed_district
        if not district:
            raise PermissionDenied("No managed district on this account.")

        today = timezone.now().date()
        insight = Insight.objects.filter(scope=Insight.SCOPE_DISTRICT, district=district, summary_date=today).first()
        if not insight:
            insight = generate_insight(today, district=district)
        return Response(InsightSerializer(insight).data)

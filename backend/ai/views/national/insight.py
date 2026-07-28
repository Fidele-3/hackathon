from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.models import Insight
from ai.serializers.common.insight import InsightSerializer
from ai.services.insight_generation import generate_insight
from users.permissions import IsNationalAdmin


class NationalInsightView(APIView):
    permission_classes = [IsNationalAdmin]

    def get(self, request):
        today = timezone.now().date()
        insight = Insight.objects.filter(scope=Insight.SCOPE_NATIONAL, summary_date=today).first()
        if not insight:
            insight = generate_insight(today, district=None)
        return Response(InsightSerializer(insight).data)

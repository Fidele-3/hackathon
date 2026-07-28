from django.urls import path

from .views.district.insight import DistrictInsightView
from .views.national.insight import NationalInsightView

urlpatterns = [
    path("insights/national/", NationalInsightView.as_view(), name="national-insight"),
    path("insights/district/", DistrictInsightView.as_view(), name="district-insight"),
]

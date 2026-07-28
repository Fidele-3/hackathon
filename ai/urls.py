from django.urls import path

from .views.district.forecast import DistrictForecastView
from .views.district.insight import DistrictInsightView
from .views.national.forecast import NationalForecastView
from .views.national.insight import NationalInsightView

urlpatterns = [
    path("insights/national/", NationalInsightView.as_view(), name="national-insight"),
    path("insights/district/", DistrictInsightView.as_view(), name="district-insight"),
    path("forecast/national/", NationalForecastView.as_view(), name="national-forecast"),
    path("forecast/district/", DistrictForecastView.as_view(), name="district-forecast"),
]

from django.urls import path

from .views.citizen.harvest import HarvestReportListCreateView
from .views.citizen.land import LandListCreateView
from .views.citizen.livestock import LivestockLocationListCreateView, LivestockProductionListCreateView
from .views.citizen.resource_request import ResourceRequestListCreateView
from .views.officer.reports import (
    OfficerHarvestReportListView,
    OfficerLandListView,
    OfficerLivestockLocationListView,
    OfficerLivestockProductionListView,
)
from .views.officer.resource_request import OfficerResourceRequestListView, ResourceRequestDecisionView

urlpatterns = [
    path("lands/", LandListCreateView.as_view(), name="land-list-create"),
    path("livestock-locations/", LivestockLocationListCreateView.as_view(), name="livestock-location-list-create"),
    path("harvest-reports/", HarvestReportListCreateView.as_view(), name="harvest-report-list-create"),
    path("livestock-production/", LivestockProductionListCreateView.as_view(), name="livestock-production-list-create"),
    path("resource-requests/", ResourceRequestListCreateView.as_view(), name="resource-request-list-create"),
    path("officer/lands/", OfficerLandListView.as_view(), name="officer-land-list"),
    path("officer/harvest-reports/", OfficerHarvestReportListView.as_view(), name="officer-harvest-report-list"),
    path("officer/livestock-locations/", OfficerLivestockLocationListView.as_view(), name="officer-livestock-location-list"),
    path("officer/livestock-production/", OfficerLivestockProductionListView.as_view(), name="officer-livestock-production-list"),
    path("officer/resource-requests/", OfficerResourceRequestListView.as_view(), name="officer-resource-request-list"),
    path("officer/resource-requests/<int:pk>/decide/", ResourceRequestDecisionView.as_view(), name="resource-request-decide"),
]

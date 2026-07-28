from django.urls import path

from .views.buyer.listing import BuyerListingListView, ReserveListingView
from .views.common.catalog import CropListView, FertilizerListView, LivestockTypeListView
from .views.citizen.harvest import HarvestReportListCreateView
from .views.citizen.land import LandListCreateView
from .views.citizen.listing import HarvestListingListCreateView
from .views.citizen.livestock import LivestockLocationListCreateView, LivestockProductionListCreateView
from .views.citizen.resource_request import ResourceRequestListCreateView
from .views.citizen.storage import StorageRequestListCreateView
from .views.officer.reports import (
    OfficerHarvestReportListView,
    OfficerLandListView,
    OfficerLivestockLocationListView,
    OfficerLivestockProductionListView,
)
from .views.officer.resource_request import OfficerResourceRequestListView, ResourceRequestDecisionView
from .views.officer.storage import OfficerStorageRequestListView, StorageRequestDecisionView

urlpatterns = [
    path("lands/", LandListCreateView.as_view(), name="land-list-create"),
    path("livestock-locations/", LivestockLocationListCreateView.as_view(), name="livestock-location-list-create"),
    path("harvest-reports/", HarvestReportListCreateView.as_view(), name="harvest-report-list-create"),
    path("livestock-production/", LivestockProductionListCreateView.as_view(), name="livestock-production-list-create"),
    path("resource-requests/", ResourceRequestListCreateView.as_view(), name="resource-request-list-create"),
    path("storage-requests/", StorageRequestListCreateView.as_view(), name="storage-request-list-create"),
    path("listings/", HarvestListingListCreateView.as_view(), name="listing-list-create"),
    path("catalog/crops/", CropListView.as_view(), name="catalog-crops"),
    path("catalog/livestock-types/", LivestockTypeListView.as_view(), name="catalog-livestock-types"),
    path("catalog/fertilizers/", FertilizerListView.as_view(), name="catalog-fertilizers"),
    path("officer/lands/", OfficerLandListView.as_view(), name="officer-land-list"),
    path("officer/harvest-reports/", OfficerHarvestReportListView.as_view(), name="officer-harvest-report-list"),
    path("officer/livestock-locations/", OfficerLivestockLocationListView.as_view(), name="officer-livestock-location-list"),
    path("officer/livestock-production/", OfficerLivestockProductionListView.as_view(), name="officer-livestock-production-list"),
    path("officer/resource-requests/", OfficerResourceRequestListView.as_view(), name="officer-resource-request-list"),
    path("officer/resource-requests/<int:pk>/decide/", ResourceRequestDecisionView.as_view(), name="resource-request-decide"),
    path("officer/storage-requests/", OfficerStorageRequestListView.as_view(), name="officer-storage-request-list"),
    path("officer/storage-requests/<int:pk>/decide/", StorageRequestDecisionView.as_view(), name="storage-request-decide"),
    path("buyer/listings/", BuyerListingListView.as_view(), name="buyer-listing-list"),
    path("buyer/listings/<int:pk>/reserve/", ReserveListingView.as_view(), name="listing-reserve"),
]

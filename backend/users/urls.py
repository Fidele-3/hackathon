from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views.buyer.auth import BuyerLoginView
from .views.buyer.registration import BuyerRegisterView
from .views.citizen.auth import LoginView as CitizenLoginView
from .views.citizen.auth import RegisterView
from .views.common.auth import GoogleLoginView, OfficerLoginView
from .views.common.availability import CheckAvailabilityView
from .views.common.locations import CellListView, DistrictListView, ProvinceListView, SectorListView, VillageListView
from .views.common.profile import MeView
from .views.district.officers import CreateSectorOfficerView, SectorOfficerListView
from .views.national.buyers import BuyerProfileListView, VerifyBuyerView
from .views.national.officers import CreateDistrictOfficerView, DistrictOfficerListView
from .views.sector.officers import CellOfficerListView, CreateCellOfficerView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="citizen-register"),
    path("login/", CitizenLoginView.as_view(), name="citizen-login"),
    path("officer/login/", OfficerLoginView.as_view(), name="officer-login"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("check-availability/", CheckAvailabilityView.as_view(), name="check-availability"),
    path("locations/provinces/", ProvinceListView.as_view(), name="location-provinces"),
    path("locations/districts/", DistrictListView.as_view(), name="location-districts"),
    path("locations/sectors/", SectorListView.as_view(), name="location-sectors"),
    path("locations/cells/", CellListView.as_view(), name="location-cells"),
    path("locations/villages/", VillageListView.as_view(), name="location-villages"),
    path("officers/district/", CreateDistrictOfficerView.as_view(), name="create-district-officer"),
    path("officers/district/list/", DistrictOfficerListView.as_view(), name="list-district-officers"),
    path("officers/sector/", CreateSectorOfficerView.as_view(), name="create-sector-officer"),
    path("officers/sector/list/", SectorOfficerListView.as_view(), name="list-sector-officers"),
    path("officers/cell/", CreateCellOfficerView.as_view(), name="create-cell-officer"),
    path("officers/cell/list/", CellOfficerListView.as_view(), name="list-cell-officers"),
    path("buyers/register/", BuyerRegisterView.as_view(), name="buyer-register"),
    path("buyers/login/", BuyerLoginView.as_view(), name="buyer-login"),
    path("buyers/", BuyerProfileListView.as_view(), name="buyer-list"),
    path("buyers/<int:pk>/verify/", VerifyBuyerView.as_view(), name="buyer-verify"),
]

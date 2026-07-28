from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views.buyer.auth import BuyerLoginView
from .views.buyer.registration import BuyerRegisterView
from .views.citizen.auth import LoginView as CitizenLoginView
from .views.citizen.auth import RegisterView
from .views.common.auth import GoogleLoginView, OfficerLoginView
from .views.common.availability import CheckAvailabilityView
from .views.common.profile import MeView
from .views.district.officers import CreateSectorOfficerView
from .views.national.buyers import VerifyBuyerView
from .views.national.officers import CreateDistrictOfficerView
from .views.sector.officers import CreateCellOfficerView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="citizen-register"),
    path("login/", CitizenLoginView.as_view(), name="citizen-login"),
    path("officer/login/", OfficerLoginView.as_view(), name="officer-login"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("check-availability/", CheckAvailabilityView.as_view(), name="check-availability"),
    path("officers/district/", CreateDistrictOfficerView.as_view(), name="create-district-officer"),
    path("officers/sector/", CreateSectorOfficerView.as_view(), name="create-sector-officer"),
    path("officers/cell/", CreateCellOfficerView.as_view(), name="create-cell-officer"),
    path("buyers/register/", BuyerRegisterView.as_view(), name="buyer-register"),
    path("buyers/login/", BuyerLoginView.as_view(), name="buyer-login"),
    path("buyers/<int:pk>/verify/", VerifyBuyerView.as_view(), name="buyer-verify"),
]

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from production.models import HarvestListing
from production.serializers.buyer.listing import ReserveListingSerializer
from production.serializers.citizen.listing import HarvestListingSerializer
from users.models import User


class BuyerListingListView(generics.ListAPIView):
    serializer_class = HarvestListingSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "buyer_profile", None)
        if user.user_level != User.LEVEL_BUYER or not profile or not profile.is_verified:
            return HarvestListing.objects.none()
        assigned_cells = profile.assigned_cells.all()
        return HarvestListing.objects.filter(
            status=HarvestListing.STATUS_AVAILABLE, harvest_report__land__cell__in=assigned_cells
        )


class ReserveListingView(generics.GenericAPIView):
    serializer_class = ReserveListingSerializer

    def post(self, request, pk):
        user = request.user
        profile = getattr(user, "buyer_profile", None)
        if user.user_level != User.LEVEL_BUYER or not profile or not profile.is_verified:
            raise PermissionDenied("Only a verified buyer can reserve a listing.")

        listing = get_object_or_404(
            HarvestListing, pk=pk, status=HarvestListing.STATUS_AVAILABLE, harvest_report__land__cell__in=profile.assigned_cells.all()
        )
        serializer = self.get_serializer(context={"request": request, "listing": listing})
        updated = serializer.save()
        return Response(HarvestListingSerializer(updated).data, status=status.HTTP_200_OK)

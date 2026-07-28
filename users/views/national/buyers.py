from rest_framework import generics
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from users.models import BuyerProfile
from users.permissions import IsNationalAdmin


class VerifyBuyerView(generics.GenericAPIView):
    permission_classes = [IsNationalAdmin]

    def post(self, request, pk):
        profile = get_object_or_404(BuyerProfile, pk=pk)
        profile.is_verified = True
        profile.verified_by = request.user
        profile.save(update_fields=["is_verified", "verified_by"])
        return Response({"business_name": profile.business_name, "is_verified": True})

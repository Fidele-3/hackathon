from rest_framework import serializers

from users.models import BuyerProfile


class BuyerProfileListSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = BuyerProfile
        fields = ["id", "business_name", "phone_number", "full_name", "assigned_cells", "payment_method", "is_verified", "created_at"]
        read_only_fields = fields

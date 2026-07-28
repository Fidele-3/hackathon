from rest_framework import serializers

from users.models import BuyerProfile, OfficerProfile, User


class OfficerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficerProfile
        fields = ["level", "specialization", "managed_district", "managed_sector", "managed_cell", "work_email"]


class OfficerRosterSerializer(serializers.ModelSerializer):
    """Officer-profile-centric view (for a superior listing subordinates) --
    the reverse nesting of MeSerializer, which is user-centric."""

    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    public_id = serializers.UUIDField(source="user.public_id", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = OfficerProfile
        fields = [
            "public_id", "full_name", "phone_number", "is_active", "level",
            "specialization", "managed_district", "managed_sector", "managed_cell", "work_email",
        ]


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ["business_name", "assigned_cells", "payment_method", "is_verified"]


class MeSerializer(serializers.ModelSerializer):
    officer_profile = OfficerProfileSerializer(read_only=True)
    buyer_profile = BuyerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "public_id", "phone_number", "email", "national_id", "full_name",
            "dob", "gender", "village", "user_level", "officer_profile", "buyer_profile",
        ]
        read_only_fields = ["public_id", "national_id", "user_level"]

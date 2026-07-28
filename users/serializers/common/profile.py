from rest_framework import serializers

from users.models import OfficerProfile, User


class OfficerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficerProfile
        fields = ["level", "specialization", "managed_district", "managed_sector", "managed_cell", "work_email"]


class MeSerializer(serializers.ModelSerializer):
    officer_profile = OfficerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "public_id", "phone_number", "email", "national_id", "full_name",
            "dob", "gender", "village", "user_level", "officer_profile",
        ]
        read_only_fields = ["public_id", "national_id", "user_level"]

from django.utils.crypto import get_random_string
from rest_framework import serializers

from users.models import Cell, OfficerProfile, User


class CreateCellOfficerSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    national_id = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_null=True)
    work_email = serializers.EmailField(required=False, allow_null=True)
    dob = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=User.GENDER_CHOICES, required=False, allow_null=True)
    managed_cell = serializers.PrimaryKeyRelatedField(queryset=Cell.objects.all())
    specialization = serializers.ChoiceField(choices=OfficerProfile.SPECIALIZATION_CHOICES)

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate_national_id(self, value):
        if User.objects.filter(national_id=value).exists():
            raise serializers.ValidationError("A user with this national ID already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_managed_cell(self, value):
        district_officer = self.context["request"].user
        managed_district = district_officer.officer_profile.managed_district
        if value.sector.district_id != managed_district.id:
            raise serializers.ValidationError("This cell is outside your managed district.")
        return value

    def create(self, validated_data):
        managed_cell = validated_data.pop("managed_cell")
        specialization = validated_data.pop("specialization")
        work_email = validated_data.pop("work_email", None)
        created_by = self.context["request"].user

        raw_password = get_random_string(12)
        user = User.objects.create_user(
            password=raw_password,
            user_level=User.LEVEL_CELL_OFFICER,
            **validated_data,
        )
        OfficerProfile.objects.create(
            user=user,
            level=OfficerProfile.LEVEL_CELL,
            specialization=specialization,
            managed_cell=managed_cell,
            work_email=work_email,
            created_by=created_by,
        )
        user.generated_password = raw_password
        return user

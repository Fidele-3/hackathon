from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from users.models import BuyerProfile, Cell, User


class BuyerRegisterSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    email = serializers.EmailField(required=False, allow_null=True)
    national_id = serializers.CharField()
    full_name = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    business_name = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=BuyerProfile.PAYMENT_METHOD_CHOICES)
    assigned_cell_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)

    def validate_password(self, value):
        validate_password(value)
        return value

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

    def validate_assigned_cell_ids(self, value):
        cells = Cell.objects.filter(id__in=value)
        if len(cells) != len(set(value)):
            raise serializers.ValidationError("One or more cells do not exist.")
        return value

    def create(self, validated_data):
        assigned_cell_ids = validated_data.pop("assigned_cell_ids")
        business_name = validated_data.pop("business_name")
        payment_method = validated_data.pop("payment_method")
        password = validated_data.pop("password")

        user = User.objects.create_user(password=password, user_level=User.LEVEL_BUYER, **validated_data)
        profile = BuyerProfile.objects.create(user=user, business_name=business_name, payment_method=payment_method)
        profile.assigned_cells.set(Cell.objects.filter(id__in=assigned_cell_ids))
        return user

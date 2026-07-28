from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from users.models import User


class CitizenRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "public_id", "phone_number", "email", "national_id", "full_name",
            "dob", "gender", "village", "password",
        ]
        read_only_fields = ["public_id"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)

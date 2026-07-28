from rest_framework import serializers

from production.models import Land
from users.models import User

FIELD_TARGETS = {
    "phone_number": (User, "phone_number"),
    "email": (User, "email"),
    "national_id": (User, "national_id"),
    "upi": (Land, "upi"),
}


class AvailabilityCheckSerializer(serializers.Serializer):
    field = serializers.ChoiceField(choices=list(FIELD_TARGETS.keys()))
    value = serializers.CharField()

    def check_available(self):
        model, field_name = FIELD_TARGETS[self.validated_data["field"]]
        return not model.objects.filter(**{field_name: self.validated_data["value"]}).exists()

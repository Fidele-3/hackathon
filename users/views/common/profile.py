from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from users.serializers.common.profile import MeSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

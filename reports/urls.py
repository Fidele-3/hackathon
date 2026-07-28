from django.urls import path

from .views.common.messaging import ConversationListCreateView, MessageListCreateView

urlpatterns = [
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("conversations/<uuid:public_id>/messages/", MessageListCreateView.as_view(), name="message-list-create"),
]

from django.urls import path

from .views.common.messaging import ConversationListCreateView, EscalateConversationView, MessageListCreateView

urlpatterns = [
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("conversations/<uuid:public_id>/messages/", MessageListCreateView.as_view(), name="message-list-create"),
    path("conversations/<uuid:public_id>/escalate/", EscalateConversationView.as_view(), name="conversation-escalate"),
]

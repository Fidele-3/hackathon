from django.urls import path

from .views.common.messaging import ConversationListCreateView, EscalateConversationView, MessageListCreateView
from .views.officer.oversight import OfficerAIConversationListView, OfficerAIConversationMessagesView

urlpatterns = [
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("conversations/<uuid:public_id>/messages/", MessageListCreateView.as_view(), name="message-list-create"),
    path("conversations/<uuid:public_id>/escalate/", EscalateConversationView.as_view(), name="conversation-escalate"),
    path("officer/ai-conversations/", OfficerAIConversationListView.as_view(), name="officer-ai-conversation-list"),
    path(
        "officer/ai-conversations/<uuid:public_id>/messages/",
        OfficerAIConversationMessagesView.as_view(),
        name="officer-ai-conversation-messages",
    ),
]

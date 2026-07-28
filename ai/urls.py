from django.urls import path

from ai.views import (
    CropScanView,
    EscalateDiagnosisView,
    OfficerPriorityFeedView,
    VoiceSpeakView,
    VoiceTranscribeView,
)

urlpatterns = [
    path("crop-scan/", CropScanView.as_view(), name="ai-crop-scan"),
    path("escalate/", EscalateDiagnosisView.as_view(), name="ai-escalate"),
    path("voice/transcribe/", VoiceTranscribeView.as_view(), name="ai-voice-transcribe"),
    path("voice/speak/", VoiceSpeakView.as_view(), name="ai-voice-speak"),
    path("officer/priority-feed/", OfficerPriorityFeedView.as_view(), name="ai-officer-priority-feed"),
]

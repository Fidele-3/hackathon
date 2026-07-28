import logging

from rest_framework.parsers import FormParser
from rest_framework.permissions import AllowAny
from rest_framework.renderers import BaseRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.gemini_client import CHAT_MODEL, SYSTEM_INSTRUCTION_USSD, GeminiError, generate_content
from ai.models import AIQueryLog
from reports.models import Conversation, Message
from users.models import User

logger = logging.getLogger(__name__)

CATEGORY_LABELS = {"1": "crop", "2": "livestock"}

MENU_TEXT = (
    "CON Murakaza neza kuri Ubuhinzi / Welcome to Ubuhinzi\n"
    "1. Ikibazo cy'imyaka / Crop problem\n"
    "2. Ikibazo cy'amatungo / Livestock problem"
)
DESCRIBE_TEXT = "CON Sobanura ikibazo mu magambo make / Describe the problem in a few words:"
NOT_REGISTERED_TEXT = (
    "END Ntabwo mwiyandikishije kuri Ubuhinzi. Mwiyandikishe kuri app cyangwa mubaze "
    "umuyobozi w'akagari.\n(Not registered. Please register via the app or ask your cell officer.)"
)


class PlainTextRenderer(BaseRenderer):
    media_type = "text/plain"
    format = "text"

    def render(self, data, media_type=None, renderer_context=None):
        return data.encode("utf-8")


class USSDWebhookView(APIView):
    """
    Africa's Talking USSD callback contract: POST form fields sessionId,
    serviceCode, phoneNumber, text (the full accumulated input, steps
    joined by "*"). Response is plain text starting with CON (continue,
    more input expected) or END (terminate session).
    """

    permission_classes = [AllowAny]
    parser_classes = [FormParser]
    renderer_classes = [PlainTextRenderer]

    def post(self, request):
        # Aggregators are inconsistent about "+" vs raw MSISDN vs stray
        # whitespace from form-decoding quirks -- normalize defensively
        # rather than trust the callback payload verbatim.
        phone_number = request.data.get("phoneNumber", "").strip()
        text = request.data.get("text", "")

        if not phone_number.startswith("+"):
            phone_number = "+" + phone_number.lstrip("+ ")

        if text == "":
            return self._respond(MENU_TEXT)

        steps = text.split("*")
        if len(steps) == 1:
            if steps[0] not in CATEGORY_LABELS:
                return self._respond(MENU_TEXT)
            return self._respond(DESCRIBE_TEXT)

        category_code, problem_text = steps[0], "*".join(steps[1:])
        if category_code not in CATEGORY_LABELS or not problem_text.strip():
            return self._respond(MENU_TEXT)

        farmer = User.objects.filter(phone_number=phone_number, user_level=User.LEVEL_CITIZEN).first()
        if not farmer:
            return self._respond(NOT_REGISTERED_TEXT)

        reply = self._handle_report(farmer, problem_text.strip())
        # Hard cap regardless of whether the model actually kept to the
        # "under 150 characters" instruction -- most USSD gateways mishandle
        # or truncate mid-word past ~182 chars, so this is safer than trusting it.
        USSD_REPLY_LIMIT = 150
        if len(reply) > USSD_REPLY_LIMIT:
            reply = reply[: USSD_REPLY_LIMIT - 1].rsplit(" ", 1)[0] + "…"
        return self._respond(f"END {reply}")

    def _handle_report(self, farmer, problem_text):
        conversation, _ = Conversation.objects.get_or_create(
            farmer=farmer, channel=Conversation.CHANNEL_AI, officer=None
        )
        Message.objects.create(
            conversation=conversation, sender=farmer, body=problem_text, source=Message.SOURCE_USSD
        )

        try:
            response_text = generate_content(CHAT_MODEL, problem_text, system_instruction=SYSTEM_INSTRUCTION_USSD)
        except GeminiError:
            logger.exception("Gemini call failed for USSD report, conversation %s", conversation.pk)
            response_text = "Ntibyakunze gusubiza ubu. Mubaze umuyobozi w'akagari. (Could not respond now. Ask your cell officer.)"

        log = AIQueryLog.objects.create(
            user=farmer, query_type=AIQueryLog.QUERY_GENERAL_QA, model_used=CHAT_MODEL,
            input_text=problem_text, response_text=response_text,
        )
        Message.objects.create(
            conversation=conversation, sender=None, is_ai_message=True, body=response_text,
            ai_query=log, source=Message.SOURCE_USSD,
        )
        conversation.save(update_fields=["updated_at"])
        return response_text

    def _respond(self, text):
        return Response(text, content_type="text/plain")

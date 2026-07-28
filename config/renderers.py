from rest_framework.renderers import JSONRenderer


class StandardJSONRenderer(JSONRenderer):
    """
    Wraps every JSON response (success and error alike) in one consistent
    envelope: {status, status_code, data, message, errors}. Error responses
    are already wrapped by config.exceptions.custom_exception_handler before
    reaching here -- this renderer passes those through unchanged and only
    wraps raw view data (the success path).
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        renderer_context = renderer_context or {}
        response = renderer_context.get("response")
        status_code = response.status_code if response is not None else 200

        if isinstance(data, dict) and data.get("status") == "error":
            return super().render(data, accepted_media_type, renderer_context)

        wrapped = {
            "status": "success",
            "status_code": status_code,
            "data": data,
            "message": None,
            "errors": None,
        }
        return super().render(wrapped, accepted_media_type, renderer_context)

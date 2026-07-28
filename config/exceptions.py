from rest_framework.views import exception_handler as drf_exception_handler


def _extract_message(detail):
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list) and detail:
        return _extract_message(detail[0])
    if isinstance(detail, dict) and detail:
        first_key = next(iter(detail))
        if first_key in ("detail", "non_field_errors"):
            return _extract_message(detail[first_key])
        return f"{first_key}: {_extract_message(detail[first_key])}"
    return "Request failed."


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    response.data = {
        "status": "error",
        "status_code": response.status_code,
        "data": None,
        "message": _extract_message(response.data),
        "errors": response.data,
    }
    return response

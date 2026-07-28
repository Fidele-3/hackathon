from __future__ import annotations

import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def exception_handler(exc, context):
    """DRF exception handler that guarantees JSON responses for all errors.

    Catches common Django exceptions that DRF doesn't handle by default,
    and ensures 500 errors return structured JSON instead of HTML.
    """
    if isinstance(exc, Http404):
        return Response(
            {"detail": "Not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, DjangoPermissionDenied):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    response = drf_exception_handler(exc, context)

    if response is not None:
        return response

    # Unhandled exceptions — log and return JSON 500
    logger.exception("Unhandled exception: %s", exc)
    return Response(
        {"detail": "An internal server error occurred. Please try again later."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

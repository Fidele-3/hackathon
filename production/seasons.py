"""
Rwanda's real agricultural calendar (3 seasons/year), mirrored from the
proven logic in ~/Documents/new/ImbutoTech (users/models/addresses.py Cell
model) -- not reinvented.

Season A: Sep-Feb (main season, short rains)
Season B: Feb-Jun (main season, long rains)
Season C: Jun-Sep (dry season, marshland/irrigated)
"""
from django.utils import timezone

SEASON_CHOICES = [("A", "Season A"), ("B", "Season B"), ("C", "Season C")]


def get_current_season(at=None):
    at = at or timezone.now()
    month = at.month
    if month in (9, 10, 11, 12, 1, 2):
        return "A"
    if month in (3, 4, 5, 6):
        return "B"
    return "C"  # 7, 8


def get_current_season_year(at=None):
    at = at or timezone.now()
    # Season A spans two calendar years (Sep-Feb) -- attribute it to the year it starts in.
    if at.month in (1, 2) and get_current_season(at) == "A":
        return at.year - 1
    return at.year

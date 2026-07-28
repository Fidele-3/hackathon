# Rwanda's real 3-season agricultural calendar: A = Sep-Feb, B = Mar-Jun, C = Jul-Aug.
from django.utils import timezone

SEASON_CHOICES = [("A", "Season A"), ("B", "Season B"), ("C", "Season C")]


def get_current_season(at=None):
    at = at or timezone.now()
    month = at.month
    if month in (9, 10, 11, 12, 1, 2):
        return "A"
    if month in (3, 4, 5, 6):
        return "B"
    return "C"


def get_current_season_year(at=None):
    at = at or timezone.now()
    # Season A spans Jan-Dec boundary; attribute Jan/Feb to the year it started in.
    if at.month in (1, 2) and get_current_season(at) == "A":
        return at.year - 1
    return at.year

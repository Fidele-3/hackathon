from django.db.models import Q

from .models import OfficerProfile


def officer_jurisdiction_filter(user, cell_field):
    """Q object restricting a queryset to an officer's jurisdiction, walking
    up to `cell_field` (a Cell FK, e.g. "cell" or "land__cell"). Empty
    (matches nothing) for a non-officer; unrestricted for national level.
    """
    profile = getattr(user, "officer_profile", None)
    if not profile:
        return Q(pk__in=[])
    if profile.level == OfficerProfile.LEVEL_NATIONAL:
        return Q()
    if profile.level == OfficerProfile.LEVEL_DISTRICT:
        return Q(**{f"{cell_field}__sector__district": profile.managed_district})
    if profile.level == OfficerProfile.LEVEL_SECTOR:
        return Q(**{f"{cell_field}__sector": profile.managed_sector})
    return Q(**{cell_field: profile.managed_cell})


def can_manage_category(user, category):
    """Whether this officer's specialization matches the given category
    (FarmerIssue.CATEGORY_CROP/CATEGORY_LIVESTOCK) -- national admins (no
    specialization) can manage both.
    """
    profile = getattr(user, "officer_profile", None)
    if not profile:
        return False
    if profile.level == OfficerProfile.LEVEL_NATIONAL:
        return True
    expected = (
        OfficerProfile.SPECIALIZATION_AGRONOMIST if category == "crop" else OfficerProfile.SPECIALIZATION_VETERINARY
    )
    return profile.specialization == expected

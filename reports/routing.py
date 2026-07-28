from users.models import OfficerProfile

CATEGORY_TO_SPECIALIZATION = {
    "crop": OfficerProfile.SPECIALIZATION_AGRONOMIST,
    "livestock": OfficerProfile.SPECIALIZATION_VETERINARY,
}


def find_cell_officer(cell, category):
    specialization = CATEGORY_TO_SPECIALIZATION[category]
    return OfficerProfile.objects.filter(
        level=OfficerProfile.LEVEL_CELL, managed_cell=cell, specialization=specialization, is_active=True
    ).first()

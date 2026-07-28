from django.db import models

from .addresses import Cell, District
from .user import User


class OfficerProfile(models.Model):
    LEVEL_NATIONAL = "national"
    LEVEL_DISTRICT = "district"
    LEVEL_CELL = "cell"
    LEVEL_CHOICES = [
        (LEVEL_NATIONAL, "National"),
        (LEVEL_DISTRICT, "District"),
        (LEVEL_CELL, "Cell"),
    ]

    SPECIALIZATION_AGRONOMIST = "agronomist"
    SPECIALIZATION_VETERINARY = "veterinary"
    SPECIALIZATION_CHOICES = [
        (SPECIALIZATION_AGRONOMIST, "Agronomist"),
        (SPECIALIZATION_VETERINARY, "Veterinary"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="officer_profile")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATION_CHOICES, null=True, blank=True)

    managed_district = models.ForeignKey(
        District, null=True, blank=True, on_delete=models.SET_NULL, related_name="district_officers"
    )
    managed_cell = models.ForeignKey(
        Cell, null=True, blank=True, on_delete=models.SET_NULL, related_name="cell_officers"
    )

    work_email = models.EmailField(null=True, blank=True)
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="officers_created"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(level="national", managed_district__isnull=True, managed_cell__isnull=True)
                    | models.Q(level="district", managed_district__isnull=False, managed_cell__isnull=True)
                    | models.Q(level="cell", managed_cell__isnull=False)
                ),
                name="officer_jurisdiction_matches_level",
            ),
        ]

    def __str__(self):
        return f"{self.user.full_name} - {self.level}"

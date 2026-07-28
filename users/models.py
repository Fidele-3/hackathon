import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


# --- Rwanda administrative hierarchy -----------------------------------
# Model names are chosen so Django's default table naming (`users_<model>`)
# matches location_tables_data.sql (users_province/district/sector/cell/village)
# exactly -- the dump loads with zero table renaming.

class Province(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class District(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    province = models.ForeignKey(Province, related_name="districts", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Sector(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    district = models.ForeignKey(District, related_name="sectors", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Cell(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    sector = models.ForeignKey(Sector, related_name="cells", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Village(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    cell = models.ForeignKey(Cell, related_name="villages", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


# --- User ----------------------------------------------------------------

class UserManager(BaseUserManager):
    def create_user(self, phone_number, national_id, full_name, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Phone number is required.")
        if not national_id:
            raise ValueError("National ID is required.")
        if extra_fields.get("email"):
            extra_fields["email"] = self.normalize_email(extra_fields["email"])
        user = self.model(
            phone_number=phone_number,
            national_id=national_id,
            full_name=full_name,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, national_id, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("user_level", User.LEVEL_NATIONAL_ADMIN)
        return self.create_user(phone_number, national_id, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    LEVEL_CITIZEN = "citizen"
    LEVEL_NATIONAL_ADMIN = "national_admin"
    LEVEL_DISTRICT_OFFICER = "district_officer"
    LEVEL_CELL_OFFICER = "cell_officer"
    USER_LEVEL_CHOICES = [
        (LEVEL_CITIZEN, "Citizen / Farmer"),
        (LEVEL_NATIONAL_ADMIN, "National Admin"),
        (LEVEL_DISTRICT_OFFICER, "District Officer"),
        (LEVEL_CELL_OFFICER, "Cell Officer"),
    ]

    GENDER_CHOICES = [("male", "Male"), ("female", "Female")]

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)

    # Required, unique -- primary login identifier.
    phone_number = models.CharField(max_length=20, unique=True)
    # Optional, but unique when provided; also usable as a login identifier.
    email = models.EmailField(unique=True, null=True, blank=True)
    # Required, unique -- real farmer/officer identity, ministry-grade accountability.
    national_id = models.CharField(max_length=20, unique=True)

    full_name = models.CharField(max_length=150)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)

    # Set when the account was created/linked via "Sign in with Google".
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)

    user_level = models.CharField(max_length=20, choices=USER_LEVEL_CHOICES, default=LEVEL_CITIZEN)

    # Farmer's home village; cell/sector/district/province are derived via village.cell...
    # Not used for officers -- their jurisdiction lives on OfficerProfile instead.
    village = models.ForeignKey(Village, null=True, blank=True, on_delete=models.SET_NULL, related_name="residents")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["national_id", "full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"

    @property
    def is_officer(self):
        return self.user_level in (
            self.LEVEL_NATIONAL_ADMIN,
            self.LEVEL_DISTRICT_OFFICER,
            self.LEVEL_CELL_OFFICER,
        )


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
    # Required at district/cell level (crop issues -> agronomist, livestock issues -> veterinary).
    # Irrelevant at national level.
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

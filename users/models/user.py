import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from .addresses import Village


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
    LEVEL_SECTOR_OFFICER = "sector_officer"
    LEVEL_CELL_OFFICER = "cell_officer"
    USER_LEVEL_CHOICES = [
        (LEVEL_CITIZEN, "Citizen / Farmer"),
        (LEVEL_NATIONAL_ADMIN, "National Admin"),
        (LEVEL_DISTRICT_OFFICER, "District Officer"),
        (LEVEL_SECTOR_OFFICER, "Sector Officer"),
        (LEVEL_CELL_OFFICER, "Cell Officer"),
    ]

    GENDER_CHOICES = [("male", "Male"), ("female", "Female")]

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)

    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    national_id = models.CharField(max_length=20, unique=True)

    full_name = models.CharField(max_length=150)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)

    user_level = models.CharField(max_length=20, choices=USER_LEVEL_CHOICES, default=LEVEL_CITIZEN)

    # Officers' jurisdiction lives on OfficerProfile, not here.
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
            self.LEVEL_SECTOR_OFFICER,
            self.LEVEL_CELL_OFFICER,
        )

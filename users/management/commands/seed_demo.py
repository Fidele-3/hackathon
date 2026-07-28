from django.core.management.base import BaseCommand
from django.db import transaction

from production.models import Crop, Land
from users.models import Cell, District, OfficerProfile, Province, Sector, User, Village


class Command(BaseCommand):
    help = "Seed demo farmer, cell agronomist, and maize land for the hackathon demo."

    @transaction.atomic
    def handle(self, *args, **options):
        province, _ = Province.objects.get_or_create(name="Northern Province")
        district, _ = District.objects.get_or_create(name="Musanze", defaults={"province": province})
        if district.province_id != province.id:
            district.province = province
            district.save(update_fields=["province"])
        sector, _ = Sector.objects.get_or_create(name="Muhoza", defaults={"district": district})
        cell, _ = Cell.objects.get_or_create(name="Cyabararika", defaults={"sector": sector})
        village, _ = Village.objects.get_or_create(name="Ryaruhanga", defaults={"cell": cell})

        crop, _ = Crop.objects.get_or_create(name="Maize", defaults={"local_name": "Ibigori"})

        farmer, created = User.objects.get_or_create(
            phone_number="+250788000001",
            defaults={
                "national_id": "1199880012345678",
                "full_name": "Jean Habimana",
                "user_level": User.LEVEL_CITIZEN,
                "village": village,
                "gender": "male",
            },
        )
        if created:
            farmer.set_password("demo1234")
            farmer.save()
        else:
            farmer.village = village
            farmer.set_password("demo1234")
            farmer.save()

        officer_user, created = User.objects.get_or_create(
            phone_number="+250788000010",
            defaults={
                "national_id": "1199700098765432",
                "full_name": "Alice Uwase",
                "user_level": User.LEVEL_CELL_OFFICER,
                "email": "alice.officer@ehinga.rw",
            },
        )
        if created or True:
            officer_user.user_level = User.LEVEL_CELL_OFFICER
            officer_user.set_password("demo1234")
            officer_user.save()

        OfficerProfile.objects.update_or_create(
            user=officer_user,
            defaults={
                "level": OfficerProfile.LEVEL_CELL,
                "specialization": OfficerProfile.SPECIALIZATION_AGRONOMIST,
                "managed_cell": cell,
                "work_email": "alice.officer@ehinga.rw",
                "is_active": True,
            },
        )

        land, _ = Land.objects.get_or_create(
            upi="1/02/05/01/1234",
            defaults={
                "owner": farmer,
                "cell": cell,
                "hectares": 0.25,
                "planted_crop": crop,
                "season": "A",
                "season_year": 2026,
            },
        )
        if land.owner_id != farmer.id:
            land.owner = farmer
            land.cell = cell
            land.planted_crop = crop
            land.save()

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write("Farmer:  +250788000001 / demo1234  (Jean Habimana)")
        self.stdout.write("Officer: +250788000010 / demo1234  (Alice Uwase)")
        self.stdout.write(f"Land id: {land.pk}  Cell: {cell.name}, Musanze")

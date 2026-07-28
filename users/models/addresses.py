from django.db import models

# Model names match Django's default table naming (users_<model>) to
# location_tables_data.sql (users_province/district/sector/cell/village)
# exactly, so the real Rwanda dataset imports with zero renaming.


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

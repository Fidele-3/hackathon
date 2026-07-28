from django.db import models


class Crop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    local_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class LivestockType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    local_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Fertilizer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    fertilizer_type = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

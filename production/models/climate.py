from django.db import models

from users.models import Cell


class CellClimateData(models.Model):
    cell = models.OneToOneField(Cell, on_delete=models.CASCADE, related_name="climate_data")
    next_24h_forecast = models.JSONField(null=True, blank=True)
    forecast_fetched_at = models.DateTimeField(null=True, blank=True)
    past_3_months_data = models.JSONField(null=True, blank=True)
    historical_fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Climate data for {self.cell.name}"

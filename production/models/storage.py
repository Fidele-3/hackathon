from django.conf import settings
from django.db import models

from users.models import Cell

from .catalog import Crop
from .harvest import HarvestReport


class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    cell = models.ForeignKey(Cell, on_delete=models.PROTECT, related_name="warehouses")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.cell.name})"

    def available_capacity_for_crop(self, crop):
        """
        Counts APPROVED and STORED (not just physically STORED) as committed
        against capacity -- an approval is a real commitment of space even
        before delivery, so a new request can't be accepted on top of it and
        silently over-book the warehouse once both are eventually fulfilled.
        """
        capacity = self.capacities.filter(crop=crop).first()
        if not capacity:
            return 0
        committed = self.storage_requests.filter(
            harvest_report__crop=crop,
            status__in=[StorageRequest.STATUS_APPROVED, StorageRequest.STATUS_STORED],
        ).aggregate(total=models.Sum("quantity_kg"))["total"] or 0
        return max(capacity.max_capacity_kg - committed, 0)

    @staticmethod
    def find_available_warehouse(district, crop, quantity_kg):
        warehouses = Warehouse.objects.filter(cell__sector__district=district, is_active=True)
        for warehouse in warehouses:
            if warehouse.available_capacity_for_crop(crop) >= quantity_kg:
                return warehouse
        return None


class WarehouseCapacity(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="capacities")
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name="warehouse_capacities")
    max_capacity_kg = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        unique_together = ("warehouse", "crop")

    def __str__(self):
        return f"{self.crop} capacity {self.max_capacity_kg}kg @ {self.warehouse.name}"


class StorageRequest(models.Model):
    STATUS_REQUESTED = "requested"
    STATUS_APPROVED = "approved"
    STATUS_STORED = "stored"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_REQUESTED, "Requested"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_STORED, "Stored"),
        (STATUS_REJECTED, "Rejected"),
    ]

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="storage_requests")
    harvest_report = models.ForeignKey(HarvestReport, on_delete=models.CASCADE, related_name="storage_requests")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="storage_requests")
    quantity_kg = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)

    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="storage_requests_decided"
    )
    decision_comment = models.TextField(blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    stored_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Storage request #{self.pk} ({self.status})"

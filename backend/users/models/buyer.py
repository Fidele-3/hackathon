from django.db import models

from .addresses import Cell
from .user import User


class BuyerProfile(models.Model):
    PAYMENT_MOBILE_MONEY = "mobile_money"
    PAYMENT_BANK = "bank"
    PAYMENT_CASH = "cash"
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_MOBILE_MONEY, "Mobile Money"),
        (PAYMENT_BANK, "Bank Transfer"),
        (PAYMENT_CASH, "Cash"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="buyer_profile")
    business_name = models.CharField(max_length=150)
    assigned_cells = models.ManyToManyField(Cell, related_name="buyers", blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default=PAYMENT_MOBILE_MONEY)
    # False until a national admin verifies the business is real -- unverified
    # buyers can register but see no listings, so a farmer's produce is never
    # exposed to an unvetted account.
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="buyers_verified")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.business_name} ({'verified' if self.is_verified else 'unverified'})"

from django.db import models
from users.models import User


class Payment(models.Model):
    """Payment transactions"""
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_GATEWAY = (
        ('payu', 'PayU'),
        ('razorpay', 'Razorpay'),
        ('wallet', 'Wallet'),
    )

    PAYMENT_PURPOSE = (
        ('wallet_recharge', 'Wallet Recharge'),
        ('consultation', 'Consultation'),
        ('booking', 'Booking'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')

    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    gateway = models.CharField(max_length=20, choices=PAYMENT_GATEWAY)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    purpose = models.CharField(max_length=50, choices=PAYMENT_PURPOSE)

    # Transaction IDs
    transaction_id = models.CharField(max_length=100, unique=True)
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    gateway_order_id = models.CharField(max_length=100, blank=True)

    # PayU specific fields
    payu_hash = models.CharField(max_length=255, blank=True)
    payu_response = models.JSONField(null=True, blank=True)

    # Metadata
    payment_method = models.CharField(max_length=50, blank=True)  # UPI, Card, NetBanking, etc.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} - {self.get_status_display()}"


class Refund(models.Model):
    """Refund requests"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )

    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='refund')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refunds')

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()

    # Admin fields
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_refunds')
    admin_notes = models.TextField(blank=True)

    # Refund transaction ID
    refund_transaction_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund for {self.payment.transaction_id} - ₹{self.amount}"

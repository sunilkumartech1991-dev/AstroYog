from django.db import models
from users.models import User


class Notification(models.Model):
    """In-app notifications"""
    NOTIFICATION_TYPES = (
        ('consultation_request', 'Consultation Request'),
        ('consultation_accepted', 'Consultation Accepted'),
        ('consultation_completed', 'Consultation Completed'),
        ('payment_success', 'Payment Successful'),
        ('wallet_credit', 'Wallet Credited'),
        ('booking_reminder', 'Booking Reminder'),
        ('new_review', 'New Review'),
        ('payout_processed', 'Payout Processed'),
        ('general', 'General'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()

    # Related objects (optional)
    related_id = models.PositiveIntegerField(null=True, blank=True)
    related_type = models.CharField(max_length=50, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"

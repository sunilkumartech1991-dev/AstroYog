from django.db import models
from django.core.validators import MinValueValidator
from users.models import User
from astrologers.models import AstrologerProfile
from django.utils import timezone


class Consultation(models.Model):
    """Main consultation model for all types of consultations"""
    CONSULTATION_TYPES = (
        ('chat', 'Chat'),
        ('call', 'Voice Call'),
        ('video', 'Video Call'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations')
    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='consultations')

    consultation_type = models.CharField(max_length=10, choices=CONSULTATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Pricing
    rate_per_minute = models.DecimalField(max_digits=6, decimal_places=2)
    total_minutes = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Timing
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    # For call/video
    call_sid = models.CharField(max_length=100, blank=True)  # Twilio Call SID
    channel_name = models.CharField(max_length=100, blank=True)  # Agora channel name
    agora_token = models.TextField(blank=True)

    # Notes
    user_notes = models.TextField(blank=True, help_text="User's reason for consultation")
    astrologer_notes = models.TextField(blank=True, help_text="Astrologer's notes")

    # Cancellation
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cancelled_consultations')
    cancellation_reason = models.TextField(blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['astrologer', '-created_at']),
            models.Index(fields=['status', 'consultation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.astrologer.display_name} - {self.get_consultation_type_display()}"

    def calculate_total_amount(self):
        """Calculate total amount based on duration"""
        if self.started_at and self.ended_at:
            duration = (self.ended_at - self.started_at).total_seconds() / 60
            self.total_minutes = int(duration)
            self.total_amount = self.rate_per_minute * self.total_minutes
            self.save(update_fields=['total_minutes', 'total_amount'])


class ChatMessage(models.Model):
    """Chat messages for text consultations"""
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
    )

    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()
    file_url = models.URLField(blank=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['consultation', 'created_at']),
        ]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"


class Booking(models.Model):
    """Scheduled bookings for future consultations"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='bookings')
    consultation = models.OneToOneField(Consultation, on_delete=models.SET_NULL, null=True, blank=True, related_name='booking')

    consultation_type = models.CharField(max_length=10, choices=Consultation.CONSULTATION_TYPES)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=30)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rate_per_minute = models.DecimalField(max_digits=6, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Notes
    user_notes = models.TextField(blank=True)
    reminder_sent = models.BooleanField(default=False)

    # Cancellation
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cancelled_bookings')
    cancellation_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['scheduled_date', 'scheduled_time']
        indexes = [
            models.Index(fields=['user', 'scheduled_date']),
            models.Index(fields=['astrologer', 'scheduled_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.astrologer.display_name} on {self.scheduled_date} {self.scheduled_time}"

    def is_upcoming(self):
        """Check if booking is in the future"""
        from datetime import datetime
        booking_datetime = datetime.combine(self.scheduled_date, self.scheduled_time)
        return booking_datetime > timezone.now()


class ConsultationFeedback(models.Model):
    """Feedback/rating for consultations"""
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultation_feedbacks')

    rating = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    feedback_text = models.TextField(blank=True)

    # Specific ratings
    communication_rating = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=5)
    knowledge_rating = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=5)
    guidance_rating = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=5)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consultation_feedbacks'

    def __str__(self):
        return f"Feedback for {self.consultation.id} - {self.rating}/5"

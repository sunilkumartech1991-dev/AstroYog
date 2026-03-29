from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class AstrologerProfile(models.Model):
    """Extended profile for Astrologers/Guruji's"""
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )

    AVAILABILITY_STATUS = (
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('busy', 'Busy'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='astrologer_profile')

    # Professional Info
    display_name = models.CharField(max_length=100, help_text="Public display name")
    bio = models.TextField(help_text="Brief introduction about the astrologer")
    experience_years = models.PositiveIntegerField(default=0)
    qualification = models.CharField(max_length=255, blank=True)
    languages = models.JSONField(default=list, help_text="List of languages spoken")

    # Verification
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verification_documents = models.JSONField(default=list, help_text="List of document URLs")
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_astrologers')

    # Pricing (per minute in INR)
    chat_price = models.DecimalField(max_digits=6, decimal_places=2, default=10.00)
    call_price = models.DecimalField(max_digits=6, decimal_places=2, default=15.00)
    video_price = models.DecimalField(max_digits=6, decimal_places=2, default=30.00)

    # Availability
    is_available = models.BooleanField(default=False)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_STATUS, default='offline')

    # Statistics
    total_consultations = models.PositiveIntegerField(default=0)
    total_minutes = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.PositiveIntegerField(default=0)

    # Earnings
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pending_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Featured/Promoted
    is_featured = models.BooleanField(default=False)
    is_top_rated = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'astrologer_profiles'
        ordering = ['display_order', '-average_rating']
        indexes = [
            models.Index(fields=['verification_status', 'is_available']),
            models.Index(fields=['is_featured', 'is_top_rated']),
        ]

    def __str__(self):
        return f"{self.display_name} - {self.get_verification_status_display()}"


class Specialization(models.Model):
    """Astrology specializations/categories"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='specializations/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'specializations'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class AstrologerSpecialization(models.Model):
    """Link astrologers to their specializations"""
    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='specializations')
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)
    proficiency_level = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1=Beginner, 5=Expert"
    )

    class Meta:
        db_table = 'astrologer_specializations'
        unique_together = ['astrologer', 'specialization']

    def __str__(self):
        return f"{self.astrologer.display_name} - {self.specialization.name}"


class AstrologerAvailability(models.Model):
    """Weekly availability schedule for astrologers"""
    DAYS_OF_WEEK = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='availability_schedule')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'astrologer_availability'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['astrologer', 'day_of_week', 'start_time']

    def __str__(self):
        return f"{self.astrologer.display_name} - {self.get_day_of_week_display()}: {self.start_time}-{self.end_time}"


class AstrologerReview(models.Model):
    """Reviews and ratings for astrologers"""
    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='astrologer_reviews')
    consultation = models.ForeignKey('consultations.Consultation', on_delete=models.CASCADE, null=True, blank=True)

    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(blank=True)

    # Admin moderation
    is_approved = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'astrologer_reviews'
        ordering = ['-created_at']
        unique_together = ['astrologer', 'user', 'consultation']
        indexes = [
            models.Index(fields=['astrologer', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} rated {self.astrologer.display_name} - {self.rating}/5"


class AstrologerPayout(models.Model):
    """Payout requests and history for astrologers"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )

    astrologer = models.ForeignKey(AstrologerProfile, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Payment details
    payment_method = models.CharField(max_length=50)
    account_details = models.JSONField(help_text="Bank account or UPI details")
    transaction_id = models.CharField(max_length=100, blank=True)

    # Admin fields
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payouts')
    processed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'astrologer_payouts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.astrologer.display_name} - ₹{self.amount} - {self.get_status_display()}"

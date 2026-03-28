from django.db import models
from users.models import User


class Kundli(models.Model):
    """Birth chart / Kundli for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kundlis')

    # Birth details
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    time_of_birth = models.TimeField()
    place_of_birth = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timezone = models.CharField(max_length=50)

    # Calculated details (stored as JSON)
    planetary_positions = models.JSONField(default=dict)
    houses = models.JSONField(default=dict)
    ascendant = models.CharField(max_length=50, blank=True)
    moon_sign = models.CharField(max_length=50, blank=True)
    sun_sign = models.CharField(max_length=50, blank=True)
    nakshatra = models.CharField(max_length=50, blank=True)

    # Chart data
    chart_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kundlis'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - Kundli"


class DailyHoroscope(models.Model):
    """Daily horoscope for all zodiac signs"""
    ZODIAC_SIGNS = (
        ('aries', 'Aries'),
        ('taurus', 'Taurus'),
        ('gemini', 'Gemini'),
        ('cancer', 'Cancer'),
        ('leo', 'Leo'),
        ('virgo', 'Virgo'),
        ('libra', 'Libra'),
        ('scorpio', 'Scorpio'),
        ('sagittarius', 'Sagittarius'),
        ('capricorn', 'Capricorn'),
        ('aquarius', 'Aquarius'),
        ('pisces', 'Pisces'),
    )

    zodiac_sign = models.CharField(max_length=20, choices=ZODIAC_SIGNS)
    date = models.DateField()

    # Horoscope content
    general = models.TextField()
    love = models.TextField(blank=True)
    career = models.TextField(blank=True)
    health = models.TextField(blank=True)
    finance = models.TextField(blank=True)

    # Ratings
    lucky_number = models.PositiveIntegerField(null=True, blank=True)
    lucky_color = models.CharField(max_length=50, blank=True)
    mood = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_horoscopes'
        unique_together = ['zodiac_sign', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_zodiac_sign_display()} - {self.date}"

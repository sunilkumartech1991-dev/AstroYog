from django.contrib import admin
from .models import Kundli, DailyHoroscope


@admin.register(Kundli)
class KundliAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'date_of_birth', 'place_of_birth', 'moon_sign', 'sun_sign', 'created_at']
    list_filter = ['moon_sign', 'sun_sign', 'created_at']
    search_fields = ['name', 'user__username', 'place_of_birth']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(DailyHoroscope)
class DailyHoroscopeAdmin(admin.ModelAdmin):
    list_display = ['zodiac_sign', 'date', 'lucky_number', 'lucky_color', 'mood']
    list_filter = ['zodiac_sign', 'date']
    search_fields = ['zodiac_sign']
    ordering = ['-date', 'zodiac_sign']

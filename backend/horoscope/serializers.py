from rest_framework import serializers
from .models import Kundli, DailyHoroscope


class KundliSerializer(serializers.ModelSerializer):
    """Serializer for Kundli"""
    class Meta:
        model = Kundli
        fields = '__all__'
        read_only_fields = ['user', 'planetary_positions', 'houses', 'ascendant',
                            'moon_sign', 'sun_sign', 'nakshatra', 'chart_data',
                            'created_at', 'updated_at']


class GenerateKundliSerializer(serializers.Serializer):
    """Serializer for generating Kundli"""
    name = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField()
    time_of_birth = serializers.TimeField()
    place_of_birth = serializers.CharField(max_length=255)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    timezone = serializers.CharField(max_length=50, default='Asia/Kolkata')


class DailyHoroscopeSerializer(serializers.ModelSerializer):
    """Serializer for Daily Horoscope"""
    zodiac_name = serializers.CharField(source='get_zodiac_sign_display', read_only=True)

    class Meta:
        model = DailyHoroscope
        fields = '__all__'

from rest_framework import serializers
from .models import (
    AstrologerProfile, Specialization, AstrologerSpecialization,
    AstrologerAvailability, AstrologerReview, AstrologerPayout
)
from users.serializers import UserSerializer


class SpecializationSerializer(serializers.ModelSerializer):
    """Serializer for specializations"""
    class Meta:
        model = Specialization
        fields = '__all__'


class AstrologerSpecializationSerializer(serializers.ModelSerializer):
    """Serializer for astrologer specializations"""
    specialization_detail = SpecializationSerializer(source='specialization', read_only=True)

    class Meta:
        model = AstrologerSpecialization
        fields = ['id', 'specialization', 'specialization_detail', 'proficiency_level']


class AstrologerAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for astrologer availability"""
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = AstrologerAvailability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_active']


class AstrologerReviewSerializer(serializers.ModelSerializer):
    """Serializer for astrologer reviews"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_profile_image = serializers.ImageField(source='user.profile_image', read_only=True)

    class Meta:
        model = AstrologerReview
        fields = ['id', 'user', 'user_name', 'user_profile_image', 'rating',
                  'review_text', 'is_featured', 'created_at']
        read_only_fields = ['user', 'created_at']


class AstrologerProfileSerializer(serializers.ModelSerializer):
    """Detailed serializer for astrologer profile"""
    user_details = UserSerializer(source='user', read_only=True)
    specializations = AstrologerSpecializationSerializer(many=True, read_only=True)
    availability_schedule = AstrologerAvailabilitySerializer(many=True, read_only=True)
    reviews = AstrologerReviewSerializer(many=True, read_only=True)

    class Meta:
        model = AstrologerProfile
        fields = '__all__'
        read_only_fields = ['user', 'verification_status', 'verified_at', 'verified_by',
                            'total_consultations', 'total_minutes', 'average_rating',
                            'total_reviews', 'total_earnings', 'pending_earnings',
                            'is_featured', 'is_top_rated', 'created_at', 'updated_at']


class AstrologerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for astrologer listings"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_profile_image = serializers.ImageField(source='user.profile_image', read_only=True)
    specializations = serializers.SerializerMethodField()

    class Meta:
        model = AstrologerProfile
        fields = ['id', 'user_name', 'user_profile_image', 'display_name', 'bio',
                  'experience_years', 'languages', 'chat_price', 'call_price',
                  'video_price', 'is_available', 'availability_status',
                  'total_consultations', 'average_rating', 'total_reviews',
                  'is_featured', 'is_top_rated', 'specializations']

    def get_specializations(self, obj):
        return [s.specialization.name for s in obj.specializations.all()[:5]]


class AstrologerPayoutSerializer(serializers.ModelSerializer):
    """Serializer for astrologer payouts"""
    astrologer_name = serializers.CharField(source='astrologer.display_name', read_only=True)

    class Meta:
        model = AstrologerPayout
        fields = '__all__'
        read_only_fields = ['astrologer', 'status', 'processed_by', 'processed_at',
                            'transaction_id', 'created_at', 'updated_at']

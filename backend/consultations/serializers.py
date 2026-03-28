from rest_framework import serializers
from .models import Consultation, ChatMessage, Booking, ConsultationFeedback
from astrologers.serializers import AstrologerListSerializer
from users.serializers import UserSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'message_type', 'content',
                  'file_url', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultations"""
    astrologer_details = AstrologerListSerializer(source='astrologer', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ['user', 'total_minutes', 'total_amount', 'created_at', 'updated_at']


class ConsultationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for consultation listings"""
    astrologer_name = serializers.CharField(source='astrologer.display_name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Consultation
        fields = ['id', 'user', 'user_name', 'astrologer', 'astrologer_name',
                  'consultation_type', 'status', 'rate_per_minute', 'total_minutes',
                  'total_amount', 'scheduled_at', 'started_at', 'ended_at', 'created_at']


class StartConsultationSerializer(serializers.Serializer):
    """Serializer for starting a consultation"""
    astrologer_id = serializers.IntegerField()
    consultation_type = serializers.ChoiceField(choices=['chat', 'call', 'video'])
    user_notes = serializers.CharField(required=False, allow_blank=True)


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""
    astrologer_details = AstrologerListSerializer(source='astrologer', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'consultation', 'created_at', 'updated_at']


class ConsultationFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for consultation feedback"""
    class Meta:
        model = ConsultationFeedback
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

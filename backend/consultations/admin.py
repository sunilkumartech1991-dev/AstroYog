from django.contrib import admin
from .models import Consultation, ChatMessage, Booking, ConsultationFeedback


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'astrologer', 'consultation_type', 'status',
                    'total_minutes', 'total_amount', 'created_at']
    list_filter = ['consultation_type', 'status', 'created_at']
    search_fields = ['user__username', 'astrologer__display_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'consultation', 'sender', 'message_type', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['consultation__id', 'sender__username', 'content']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'astrologer', 'consultation_type', 'scheduled_date',
                    'scheduled_time', 'status']
    list_filter = ['consultation_type', 'status', 'scheduled_date']
    search_fields = ['user__username', 'astrologer__display_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-scheduled_date', '-scheduled_time']


@admin.register(ConsultationFeedback)
class ConsultationFeedbackAdmin(admin.ModelAdmin):
    list_display = ['consultation', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['consultation__id', 'user__username', 'feedback_text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AstrologerProfile, Specialization, AstrologerSpecialization,
    AstrologerAvailability, AstrologerReview, AstrologerPayout
)


@admin.register(AstrologerProfile)
class AstrologerProfileAdmin(admin.ModelAdmin):
    """Admin for Astrologer Profiles (Guruji Management)"""
    list_display = ['display_name', 'user_email', 'verification_status_badge',
                    'is_available', 'total_consultations', 'average_rating',
                    'total_earnings', 'created_at']
    list_filter = ['verification_status', 'is_available', 'is_featured', 'is_top_rated', 'created_at']
    search_fields = ['display_name', 'user__email', 'user__username', 'bio']
    readonly_fields = ['user', 'total_consultations', 'total_minutes', 'average_rating',
                       'total_reviews', 'total_earnings', 'created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Professional Details', {
            'fields': ('display_name', 'bio', 'experience_years', 'qualification', 'languages')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verification_documents', 'verified_at', 'verified_by')
        }),
        ('Pricing (per minute in ₹)', {
            'fields': ('chat_price', 'call_price', 'video_price')
        }),
        ('Availability', {
            'fields': ('is_available', 'availability_status')
        }),
        ('Statistics', {
            'fields': ('total_consultations', 'total_minutes', 'average_rating', 'total_reviews')
        }),
        ('Earnings', {
            'fields': ('total_earnings', 'pending_earnings')
        }),
        ('Featured/Promoted', {
            'fields': ('is_featured', 'is_top_rated', 'display_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def verification_status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
            'suspended': 'gray'
        }
        color = colors.get(obj.verification_status, 'black')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_verification_status_display()
        )
    verification_status_badge.short_description = 'Status'

    actions = ['approve_astrologers', 'reject_astrologers', 'mark_as_featured']

    def approve_astrologers(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            verification_status='approved',
            verified_at=timezone.now(),
            verified_by=request.user
        )
        self.message_user(request, f'{updated} astrologers approved successfully.')
    approve_astrologers.short_description = 'Approve selected astrologers'

    def reject_astrologers(self, request, queryset):
        updated = queryset.update(verification_status='rejected')
        self.message_user(request, f'{updated} astrologers rejected.')
    reject_astrologers.short_description = 'Reject selected astrologers'

    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} astrologers marked as featured.')
    mark_as_featured.short_description = 'Mark as featured'


@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    """Admin for Specializations"""
    list_display = ['name', 'slug', 'is_active', 'display_order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']


@admin.register(AstrologerSpecialization)
class AstrologerSpecializationAdmin(admin.ModelAdmin):
    """Admin for Astrologer Specializations"""
    list_display = ['astrologer', 'specialization', 'proficiency_level']
    list_filter = ['specialization', 'proficiency_level']
    search_fields = ['astrologer__display_name', 'specialization__name']


@admin.register(AstrologerAvailability)
class AstrologerAvailabilityAdmin(admin.ModelAdmin):
    """Admin for Astrologer Availability"""
    list_display = ['astrologer', 'get_day_of_week_display', 'start_time', 'end_time', 'is_active']
    list_filter = ['day_of_week', 'is_active']
    search_fields = ['astrologer__display_name']
    ordering = ['astrologer', 'day_of_week', 'start_time']


@admin.register(AstrologerReview)
class AstrologerReviewAdmin(admin.ModelAdmin):
    """Admin for Astrologer Reviews"""
    list_display = ['astrologer', 'user', 'rating', 'is_approved', 'is_featured', 'created_at']
    list_filter = ['rating', 'is_approved', 'is_featured', 'created_at']
    search_fields = ['astrologer__display_name', 'user__username', 'review_text']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    actions = ['approve_reviews', 'mark_as_featured']

    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'

    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} reviews marked as featured.')
    mark_as_featured.short_description = 'Mark as featured'


@admin.register(AstrologerPayout)
class AstrologerPayoutAdmin(admin.ModelAdmin):
    """Admin for Astrologer Payouts"""
    list_display = ['astrologer', 'amount', 'status_badge', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['astrologer__display_name', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Astrologer & Amount', {
            'fields': ('astrologer', 'amount', 'status')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'account_details', 'transaction_id')
        }),
        ('Processing', {
            'fields': ('processed_by', 'processed_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'rejected': 'red'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    actions = ['mark_as_processing', 'mark_as_completed']

    def mark_as_processing(self, request, queryset):
        updated = queryset.update(status='processing', processed_by=request.user)
        self.message_user(request, f'{updated} payouts marked as processing.')
    mark_as_processing.short_description = 'Mark as processing'

    def mark_as_completed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            status='completed',
            processed_by=request.user,
            processed_at=timezone.now()
        )
        self.message_user(request, f'{updated} payouts completed.')
    mark_as_completed.short_description = 'Mark as completed'

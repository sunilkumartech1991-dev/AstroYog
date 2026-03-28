from django.contrib import admin
from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'amount', 'gateway', 'status',
                    'purpose', 'created_at']
    list_filter = ['gateway', 'status', 'purpose', 'created_at']
    search_fields = ['transaction_id', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['payment', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['payment__transaction_id', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

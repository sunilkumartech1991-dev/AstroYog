from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Wallet, UserAddress


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""
    list_display = ['username', 'email', 'phone_number', 'user_type', 'wallet_balance', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'phone_verified', 'created_at']
    search_fields = ['username', 'email', 'phone_number', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': (
            'first_name', 'last_name', 'email', 'phone_number', 'phone_verified',
            'profile_image', 'date_of_birth', 'time_of_birth', 'place_of_birth', 'gender'
        )}),
        ('Location', {'fields': ('city', 'state', 'country')}),
        ('Account Type', {'fields': ('user_type',)}),
        ('Wallet', {'fields': ('wallet_balance',)}),
        ('Referral', {'fields': ('referral_code', 'referred_by')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone_number', 'password1', 'password2', 'user_type'),
        }),
    )

    readonly_fields = ['wallet_balance', 'referral_code', 'last_login', 'date_joined']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """Wallet Transaction Admin"""
    list_display = ['user', 'transaction_type', 'amount', 'balance_after', 'status', 'created_at']
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = ['user__username', 'user__email', 'reference_id', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Transaction Details', {'fields': (
            'transaction_type', 'amount', 'balance_after', 'status', 'description'
        )}),
        ('Payment Info', {'fields': ('reference_id', 'payment_method')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    """User Address Admin"""
    list_display = ['user', 'label', 'city', 'state', 'country', 'is_default']
    list_filter = ['is_default', 'country', 'state']
    search_fields = ['user__username', 'city', 'state', 'pincode']
    ordering = ['-created_at']

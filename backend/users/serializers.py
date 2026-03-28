from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Wallet, UserAddress
import random
import string


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'phone_number',
                  'first_name', 'last_name', 'user_type', 'date_of_birth',
                  'time_of_birth', 'place_of_birth', 'gender']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})

        if User.objects.filter(phone_number=attrs['phone_number']).exists():
            raise serializers.ValidationError({"phone_number": "Phone number already exists."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        # Generate unique referral code
        referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while User.objects.filter(referral_code=referral_code).exists():
            referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

        user = User.objects.create_user(
            password=password,
            referral_code=referral_code,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        # Allow login with email or phone number
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")
        elif username.startswith('+') or username.isdigit():
            try:
                user_obj = User.objects.get(phone_number=username)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'phone_verified',
                  'first_name', 'last_name', 'full_name', 'user_type',
                  'profile_image', 'date_of_birth', 'time_of_birth',
                  'place_of_birth', 'gender', 'city', 'state', 'country',
                  'wallet_balance', 'referral_code', 'created_at']
        read_only_fields = ['id', 'user_type', 'wallet_balance', 'referral_code', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'profile_image', 'date_of_birth',
                  'time_of_birth', 'place_of_birth', 'gender', 'city', 'state', 'country']


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for wallet transactions"""
    class Meta:
        model = Wallet
        fields = '__all__'
        read_only_fields = ['user', 'balance_after', 'created_at', 'updated_at']


class UserAddressSerializer(serializers.ModelSerializer):
    """Serializer for user addresses"""
    class Meta:
        model = UserAddress
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password2 = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

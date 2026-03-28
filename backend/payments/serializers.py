from rest_framework import serializers
from .models import Payment, Refund


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['user', 'transaction_id', 'gateway_transaction_id',
                            'gateway_order_id', 'payu_hash', 'payu_response',
                            'status', 'paid_at', 'created_at', 'updated_at']


class InitiatePaymentSerializer(serializers.Serializer):
    """Serializer for initiating payment"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=100)
    purpose = serializers.ChoiceField(choices=Payment.PAYMENT_PURPOSE)
    gateway = serializers.ChoiceField(choices=['payu', 'razorpay'], default='payu')


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for refunds"""
    payment_details = PaymentSerializer(source='payment', read_only=True)

    class Meta:
        model = Refund
        fields = '__all__'
        read_only_fields = ['user', 'status', 'processed_by', 'admin_notes',
                            'refund_transaction_id', 'created_at', 'updated_at', 'completed_at']

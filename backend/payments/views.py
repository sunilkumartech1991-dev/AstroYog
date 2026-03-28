from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone

from .models import Payment, Refund
from users.models import Wallet
from .serializers import PaymentSerializer, InitiatePaymentSerializer, RefundSerializer
from .payu_helper import PayUHelper


class InitiatePaymentView(APIView):
    """Initiate a payment transaction"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        amount = serializer.validated_data['amount']
        purpose = serializer.validated_data['purpose']
        gateway = serializer.validated_data['gateway']

        # Generate transaction ID
        transaction_id = PayUHelper.generate_transaction_id()

        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            amount=amount,
            gateway=gateway,
            status='initiated',
            purpose=purpose,
            transaction_id=transaction_id,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        if gateway == 'payu':
            # Prepare PayU payment data
            payment_data = PayUHelper.prepare_payment_data(
                user=request.user,
                amount=amount,
                transaction_id=transaction_id,
                purpose=purpose
            )

            # Save hash
            payment.payu_hash = payment_data['hash']
            payment.save(update_fields=['payu_hash'])

            return Response({
                'payment_id': payment.id,
                'transaction_id': transaction_id,
                'payment_url': PayUHelper.get_payu_url(),
                'payment_data': payment_data
            }, status=status.HTTP_200_OK)

        return Response({
            'payment_id': payment.id,
            'transaction_id': transaction_id
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PayUSuccessView(APIView):
    """Handle PayU success callback"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payu_response = request.data

        # Verify hash
        if not PayUHelper.verify_hash(payu_response):
            return Response({"error": "Invalid hash"}, status=status.HTTP_400_BAD_REQUEST)

        transaction_id = payu_response.get('txnid')

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update payment status
        payment.status = 'success'
        payment.gateway_transaction_id = payu_response.get('mihpayid', '')
        payment.payu_response = payu_response
        payment.payment_method = payu_response.get('mode', '')
        payment.paid_at = timezone.now()
        payment.save()

        # Credit wallet if purpose is wallet recharge
        if payment.purpose == 'wallet_recharge':
            user = payment.user
            user.wallet_balance += payment.amount
            user.save(update_fields=['wallet_balance'])

            # Create wallet transaction
            Wallet.objects.create(
                user=user,
                transaction_type='credit',
                amount=payment.amount,
                balance_after=user.wallet_balance,
                status='success',
                description='Wallet recharge via PayU',
                reference_id=transaction_id,
                payment_method='payu'
            )

        return Response({
            "message": "Payment successful",
            "transaction_id": transaction_id,
            "amount": payment.amount
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PayUFailureView(APIView):
    """Handle PayU failure callback"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payu_response = request.data
        transaction_id = payu_response.get('txnid')

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            payment.status = 'failed'
            payment.payu_response = payu_response
            payment.save()
        except Payment.DoesNotExist:
            pass

        return Response({
            "message": "Payment failed",
            "transaction_id": transaction_id
        }, status=status.HTTP_200_OK)


class PaymentListView(generics.ListAPIView):
    """List user's payment transactions"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class RefundRequestView(generics.CreateAPIView):
    """Request a refund"""
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RefundListView(generics.ListAPIView):
    """List user's refund requests"""
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Refund.objects.filter(user=self.request.user)

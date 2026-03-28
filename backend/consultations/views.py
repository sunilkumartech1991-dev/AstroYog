from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from agora_token_builder import RtcTokenBuilder
import time
import uuid
from django.conf import settings

from .models import Consultation, ChatMessage, Booking, ConsultationFeedback
from astrologers.models import AstrologerProfile
from users.models import Wallet
from .serializers import (
    ConsultationSerializer, ConsultationListSerializer, ChatMessageSerializer,
    StartConsultationSerializer, BookingSerializer, ConsultationFeedbackSerializer
)


class StartConsultationView(APIView):
    """Start a new consultation (chat, call, or video)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartConsultationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        astrologer_id = serializer.validated_data['astrologer_id']
        consultation_type = serializer.validated_data['consultation_type']

        try:
            astrologer = AstrologerProfile.objects.get(id=astrologer_id)
        except AstrologerProfile.DoesNotExist:
            return Response({"error": "Astrologer not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if astrologer is available
        if not astrologer.is_available:
            return Response(
                {"error": "Astrologer is currently not available"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get rate based on consultation type
        rate_mapping = {
            'chat': astrologer.chat_price,
            'call': astrologer.call_price,
            'video': astrologer.video_price
        }
        rate_per_minute = rate_mapping[consultation_type]

        # Check if user has sufficient wallet balance (minimum 5 minutes)
        minimum_balance = rate_per_minute * 5
        if request.user.wallet_balance < minimum_balance:
            return Response({
                "error": f"Insufficient wallet balance. Minimum ₹{minimum_balance} required for 5 minutes."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create consultation
        consultation = Consultation.objects.create(
            user=request.user,
            astrologer=astrologer,
            consultation_type=consultation_type,
            rate_per_minute=rate_per_minute,
            status='pending',
            user_notes=serializer.validated_data.get('user_notes', '')
        )

        # For video/call, generate Agora token
        if consultation_type in ['call', 'video']:
            channel_name = f"consultation_{consultation.id}_{uuid.uuid4().hex[:8]}"
            app_id = settings.AGORA_APP_ID
            app_certificate = settings.AGORA_APP_CERTIFICATE
            uid = request.user.id
            expiration_time_in_seconds = 3600  # 1 hour

            current_timestamp = int(time.time())
            privilege_expired_ts = current_timestamp + expiration_time_in_seconds

            if app_id and app_certificate:
                token = RtcTokenBuilder.buildTokenWithUid(
                    app_id, app_certificate, channel_name, uid, 1, privilege_expired_ts
                )
                consultation.channel_name = channel_name
                consultation.agora_token = token
                consultation.save(update_fields=['channel_name', 'agora_token'])

        return Response({
            "consultation": ConsultationSerializer(consultation).data,
            "message": "Consultation request sent to astrologer"
        }, status=status.HTTP_201_CREATED)


class AcceptConsultationView(APIView):
    """Accept a pending consultation (astrologer only)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, consultation_id):
        try:
            consultation = Consultation.objects.get(
                id=consultation_id,
                astrologer__user=request.user
            )
        except Consultation.DoesNotExist:
            return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

        if consultation.status != 'pending':
            return Response(
                {"error": "Consultation is not pending"},
                status=status.HTTP_400_BAD_REQUEST
            )

        consultation.status = 'accepted'
        consultation.started_at = timezone.now()
        consultation.save(update_fields=['status', 'started_at'])

        return Response({
            "consultation": ConsultationSerializer(consultation).data,
            "message": "Consultation accepted"
        })


class EndConsultationView(APIView):
    """End an ongoing consultation"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, consultation_id):
        try:
            consultation = Consultation.objects.get(
                Q(id=consultation_id),
                Q(user=request.user) | Q(astrologer__user=request.user)
            )
        except Consultation.DoesNotExist:
            return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

        if consultation.status not in ['accepted', 'ongoing']:
            return Response(
                {"error": "Consultation is not active"},
                status=status.HTTP_400_BAD_REQUEST
            )

        consultation.status = 'completed'
        consultation.ended_at = timezone.now()
        consultation.save(update_fields=['status', 'ended_at'])

        # Calculate and deduct amount
        consultation.calculate_total_amount()

        # Deduct from user wallet
        user = consultation.user
        user.wallet_balance -= consultation.total_amount
        user.save(update_fields=['wallet_balance'])

        # Create wallet transaction
        Wallet.objects.create(
            user=user,
            transaction_type='debit',
            amount=consultation.total_amount,
            balance_after=user.wallet_balance,
            status='success',
            description=f'{consultation.get_consultation_type_display()} consultation with {consultation.astrologer.display_name}',
            reference_id=f'CONSULT_{consultation.id}'
        )

        # Calculate platform commission
        platform_commission = consultation.total_amount * (settings.PLATFORM_COMMISSION / 100)
        astrologer_earning = consultation.total_amount - platform_commission

        # Update astrologer earnings
        astrologer = consultation.astrologer
        astrologer.total_consultations += 1
        astrologer.total_minutes += consultation.total_minutes
        astrologer.total_earnings += astrologer_earning
        astrologer.pending_earnings += astrologer_earning
        astrologer.save(update_fields=['total_consultations', 'total_minutes', 'total_earnings', 'pending_earnings'])

        return Response({
            "consultation": ConsultationSerializer(consultation).data,
            "message": "Consultation ended successfully"
        })


class ConsultationListView(generics.ListAPIView):
    """List user's consultations"""
    serializer_class = ConsultationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'astrologer_profile'):
            # Astrologer view
            return Consultation.objects.filter(astrologer__user=user)
        else:
            # User view
            return Consultation.objects.filter(user=user)


class ConsultationDetailView(generics.RetrieveAPIView):
    """Get consultation details"""
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Consultation.objects.filter(
            Q(user=user) | Q(astrologer__user=user)
        )


class BookingListCreateView(generics.ListCreateAPIView):
    """List and create bookings"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'astrologer_profile'):
            return Booking.objects.filter(astrologer__user=user)
        else:
            return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete booking"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(
            Q(user=user) | Q(astrologer__user=user)
        )


class ConsultationFeedbackView(generics.CreateAPIView):
    """Submit feedback for a consultation"""
    serializer_class = ConsultationFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import (
    AstrologerProfile, Specialization, AstrologerReview,
    AstrologerPayout, AstrologerAvailability
)
from .serializers import (
    AstrologerProfileSerializer, AstrologerListSerializer,
    SpecializationSerializer, AstrologerReviewSerializer,
    AstrologerPayoutSerializer, AstrologerAvailabilitySerializer
)


class AstrologerListView(generics.ListAPIView):
    """List all approved astrologers with filtering"""
    serializer_class = AstrologerListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['display_name', 'bio', 'specializations__specialization__name']
    ordering_fields = ['average_rating', 'experience_years', 'total_consultations', 'chat_price']
    ordering = ['-is_featured', '-is_top_rated', '-average_rating']

    def get_queryset(self):
        queryset = AstrologerProfile.objects.filter(
            verification_status='approved',
            user__is_active=True
        ).select_related('user').prefetch_related('specializations__specialization')

        # Filter by availability
        is_available = self.request.query_params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=(is_available.lower() == 'true'))

        # Filter by specialization
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specializations__specialization__slug=specialization)

        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(languages__contains=[language])

        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        consultation_type = self.request.query_params.get('type', 'chat')

        if min_price and max_price:
            price_field = f'{consultation_type}_price'
            queryset = queryset.filter(**{
                f'{price_field}__gte': min_price,
                f'{price_field}__lte': max_price
            })

        return queryset.distinct()


class AstrologerDetailView(generics.RetrieveAPIView):
    """Get detailed astrologer profile"""
    serializer_class = AstrologerProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        return AstrologerProfile.objects.filter(
            verification_status='approved'
        ).select_related('user').prefetch_related(
            'specializations__specialization',
            'availability_schedule',
            'reviews__user'
        )


class MyAstrologerProfileView(generics.RetrieveUpdateAPIView):
    """Get and update own astrologer profile"""
    serializer_class = AstrologerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = AstrologerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class UpdateAvailabilityStatusView(APIView):
    """Update astrologer's online/offline status"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            profile = AstrologerProfile.objects.get(user=request.user)
            new_status = request.data.get('status')

            if new_status not in ['online', 'offline', 'busy']:
                return Response(
                    {"error": "Invalid status. Must be 'online', 'offline', or 'busy'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.availability_status = new_status
            profile.is_available = (new_status == 'online')
            profile.save(update_fields=['availability_status', 'is_available'])

            return Response({
                "message": "Status updated successfully",
                "status": new_status,
                "is_available": profile.is_available
            })

        except AstrologerProfile.DoesNotExist:
            return Response(
                {"error": "Astrologer profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class SpecializationListView(generics.ListAPIView):
    """List all active specializations"""
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Specialization.objects.filter(is_active=True)


class AstrologerReviewListView(generics.ListCreateAPIView):
    """List and create reviews for astrologers"""
    serializer_class = AstrologerReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        astrologer_id = self.kwargs.get('astrologer_id')
        return AstrologerReview.objects.filter(
            astrologer_id=astrologer_id,
            is_approved=True
        ).select_related('user')

    def perform_create(self, serializer):
        astrologer_id = self.kwargs.get('astrologer_id')
        serializer.save(
            user=self.request.user,
            astrologer_id=astrologer_id
        )


class AstrologerPayoutListCreateView(generics.ListCreateAPIView):
    """List and create payout requests"""
    serializer_class = AstrologerPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = AstrologerProfile.objects.get(user=self.request.user)
        return AstrologerPayout.objects.filter(astrologer=profile)

    def perform_create(self, serializer):
        profile = AstrologerProfile.objects.get(user=self.request.user)

        # Check if there's enough pending earnings
        amount = serializer.validated_data['amount']
        if amount > profile.pending_earnings:
            raise serializers.ValidationError("Insufficient pending earnings")

        serializer.save(astrologer=profile)


class AstrologerAvailabilityView(generics.ListCreateAPIView):
    """Manage astrologer availability schedule"""
    serializer_class = AstrologerAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = AstrologerProfile.objects.get(user=self.request.user)
        return AstrologerAvailability.objects.filter(astrologer=profile)

    def perform_create(self, serializer):
        profile = AstrologerProfile.objects.get(user=self.request.user)
        serializer.save(astrologer=profile)


class FeaturedAstrologersView(generics.ListAPIView):
    """Get featured/top-rated astrologers"""
    serializer_class = AstrologerListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return AstrologerProfile.objects.filter(
            verification_status='approved',
            user__is_active=True,
            is_featured=True
        ).select_related('user').prefetch_related('specializations__specialization')[:10]

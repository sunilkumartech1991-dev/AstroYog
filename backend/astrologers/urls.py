from django.urls import path
from .views import (
    AstrologerListView, AstrologerDetailView, MyAstrologerProfileView,
    UpdateAvailabilityStatusView, SpecializationListView,
    AstrologerReviewListView, AstrologerPayoutListCreateView,
    AstrologerAvailabilityView, FeaturedAstrologersView
)

urlpatterns = [
    # Astrologer listings
    path('', AstrologerListView.as_view(), name='astrologer-list'),
    path('featured/', FeaturedAstrologersView.as_view(), name='featured-astrologers'),
    path('<int:id>/', AstrologerDetailView.as_view(), name='astrologer-detail'),

    # My profile (for astrologers)
    path('profile/me/', MyAstrologerProfileView.as_view(), name='my-astrologer-profile'),
    path('profile/status/', UpdateAvailabilityStatusView.as_view(), name='update-availability'),
    path('profile/availability/', AstrologerAvailabilityView.as_view(), name='astrologer-availability'),

    # Specializations
    path('specializations/', SpecializationListView.as_view(), name='specializations'),

    # Reviews
    path('<int:astrologer_id>/reviews/', AstrologerReviewListView.as_view(), name='astrologer-reviews'),

    # Payouts
    path('payouts/', AstrologerPayoutListCreateView.as_view(), name='astrologer-payouts'),
]

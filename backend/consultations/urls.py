from django.urls import path
from .views import (
    StartConsultationView, AcceptConsultationView, EndConsultationView,
    ConsultationListView, ConsultationDetailView,
    BookingListCreateView, BookingDetailView,
    ConsultationFeedbackView
)

urlpatterns = [
    # Consultations
    path('start/', StartConsultationView.as_view(), name='start-consultation'),
    path('<int:consultation_id>/accept/', AcceptConsultationView.as_view(), name='accept-consultation'),
    path('<int:consultation_id>/end/', EndConsultationView.as_view(), name='end-consultation'),
    path('', ConsultationListView.as_view(), name='consultation-list'),
    path('<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),

    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # Feedback
    path('feedback/', ConsultationFeedbackView.as_view(), name='consultation-feedback'),
]

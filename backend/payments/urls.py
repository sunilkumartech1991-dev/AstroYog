from django.urls import path
from .views import (
    InitiatePaymentView, PayUSuccessView, PayUFailureView,
    PaymentListView, PaymentDetailView,
    RefundRequestView, RefundListView
)

urlpatterns = [
    # Payment initiation
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),

    # PayU callbacks
    path('payu/success/', PayUSuccessView.as_view(), name='payu-success'),
    path('payu/failure/', PayUFailureView.as_view(), name='payu-failure'),

    # Payment history
    path('', PaymentListView.as_view(), name='payment-list'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    # Refunds
    path('refunds/', RefundListView.as_view(), name='refund-list'),
    path('refunds/request/', RefundRequestView.as_view(), name='refund-request'),
]

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserLoginView, UserProfileView,
    ChangePasswordView, WalletTransactionListView,
    UserAddressListCreateView, UserAddressDetailView
)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Wallet
    path('wallet/transactions/', WalletTransactionListView.as_view(), name='wallet-transactions'),

    # Addresses
    path('addresses/', UserAddressListCreateView.as_view(), name='user-addresses'),
    path('addresses/<int:pk>/', UserAddressDetailView.as_view(), name='user-address-detail'),
]

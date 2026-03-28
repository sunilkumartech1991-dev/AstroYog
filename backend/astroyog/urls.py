"""
URL configuration for AstroYog project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="AstroYog API",
      default_version='v1',
      description="API documentation for AstroYog - Astrology Consultation Platform",
      terms_of_service="https://www.astroyog.com/terms/",
      contact=openapi.Contact(email="contact@astroyog.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/astrologers/', include('astrologers.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/horoscope/', include('horoscope.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

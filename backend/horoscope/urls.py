from django.urls import path
from .views import (
    GenerateKundliView, KundliListView, KundliDetailView,
    DailyHoroscopeView, AllDailyHoroscopesView
)

urlpatterns = [
    # Kundli
    path('kundli/generate/', GenerateKundliView.as_view(), name='generate-kundli'),
    path('kundli/', KundliListView.as_view(), name='kundli-list'),
    path('kundli/<int:pk>/', KundliDetailView.as_view(), name='kundli-detail'),

    # Daily Horoscope
    path('daily/<str:zodiac_sign>/', DailyHoroscopeView.as_view(), name='daily-horoscope'),
    path('daily/', AllDailyHoroscopesView.as_view(), name='all-daily-horoscopes'),
]

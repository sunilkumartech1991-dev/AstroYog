from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Kundli, DailyHoroscope
from .serializers import KundliSerializer, GenerateKundliSerializer, DailyHoroscopeSerializer
from .kundli_calculator import KundliCalculator


class GenerateKundliView(APIView):
    """Generate a new Kundli"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GenerateKundliSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            # Calculate Kundli
            calculator = KundliCalculator(
                date_of_birth=data['date_of_birth'],
                time_of_birth=data['time_of_birth'],
                latitude=data['latitude'],
                longitude=data['longitude'],
                timezone_str=data['timezone']
            )

            kundli_data = calculator.generate_kundli()

            # Create Kundli record
            kundli = Kundli.objects.create(
                user=request.user,
                name=data['name'],
                date_of_birth=data['date_of_birth'],
                time_of_birth=data['time_of_birth'],
                place_of_birth=data['place_of_birth'],
                latitude=data['latitude'],
                longitude=data['longitude'],
                timezone=data['timezone'],
                planetary_positions=kundli_data['planetary_positions'],
                houses=kundli_data['houses'],
                ascendant=kundli_data['ascendant']['zodiac_sign'],
                moon_sign=kundli_data['moon_sign'],
                sun_sign=kundli_data['sun_sign'],
                nakshatra=kundli_data['nakshatra'],
                chart_data=kundli_data
            )

            return Response({
                'kundli': KundliSerializer(kundli).data,
                'message': 'Kundli generated successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Failed to generate Kundli: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class KundliListView(generics.ListAPIView):
    """List user's Kundlis"""
    serializer_class = KundliSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Kundli.objects.filter(user=self.request.user)


class KundliDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete Kundli"""
    serializer_class = KundliSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Kundli.objects.filter(user=self.request.user)


class DailyHoroscopeView(APIView):
    """Get daily horoscope for a zodiac sign"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, zodiac_sign):
        today = timezone.now().date()

        try:
            horoscope = DailyHoroscope.objects.get(
                zodiac_sign=zodiac_sign.lower(),
                date=today
            )
            return Response(DailyHoroscopeSerializer(horoscope).data)
        except DailyHoroscope.DoesNotExist:
            return Response({
                'message': 'Horoscope not available for today'
            }, status=status.HTTP_404_NOT_FOUND)


class AllDailyHoroscopesView(generics.ListAPIView):
    """Get all daily horoscopes for today"""
    serializer_class = DailyHoroscopeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        today = timezone.now().date()
        return DailyHoroscope.objects.filter(date=today)

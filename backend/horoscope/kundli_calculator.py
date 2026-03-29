"""
Kundli/Birth Chart Calculator using Swiss Ephemeris
"""
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    # Define placeholder constants when swisseph is not available
    class swe:
        SUN = 0
        MOON = 1
        MERCURY = 2
        VENUS = 3
        MARS = 4
        JUPITER = 5
        SATURN = 6
        TRUE_NODE = 11
        SIDM_LAHIRI = 1  # Placeholder for Lahiri ayanamsa mode

from datetime import datetime
import pytz


class KundliCalculator:
    """Calculate Vedic astrology birth chart"""

    ZODIAC_SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    NAKSHATRAS = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]

    PLANETS = {
        swe.SUN: 'Sun',
        swe.MOON: 'Moon',
        swe.MERCURY: 'Mercury',
        swe.VENUS: 'Venus',
        swe.MARS: 'Mars',
        swe.JUPITER: 'Jupiter',
        swe.SATURN: 'Saturn',
        swe.TRUE_NODE: 'Rahu',  # North Node
    }

    def __init__(self, date_of_birth, time_of_birth, latitude, longitude, timezone_str='Asia/Kolkata'):
        """
        Initialize Kundli calculator
        :param date_of_birth: datetime.date object
        :param time_of_birth: datetime.time object
        :param latitude: Latitude of birth place
        :param longitude: Longitude of birth place
        :param timezone_str: Timezone string
        """
        if not SWISSEPH_AVAILABLE:
            raise ImportError(
                "Swiss Ephemeris library (pyswisseph) is not installed. "
                "Install it with: pip install pyswisseph "
                "(Note: Requires Microsoft Visual C++ Build Tools on Windows)"
            )

        self.date_of_birth = date_of_birth
        self.time_of_birth = time_of_birth
        self.latitude = float(latitude)
        self.longitude = float(longitude)
        self.timezone = pytz.timezone(timezone_str)

        # Combine date and time
        birth_datetime = datetime.combine(date_of_birth, time_of_birth)
        birth_datetime = self.timezone.localize(birth_datetime)

        # Convert to UTC for calculations
        self.birth_datetime_utc = birth_datetime.astimezone(pytz.UTC)

        # Calculate Julian Day
        self.jd = swe.julday(
            self.birth_datetime_utc.year,
            self.birth_datetime_utc.month,
            self.birth_datetime_utc.day,
            self.birth_datetime_utc.hour + self.birth_datetime_utc.minute / 60.0
        )

        # Set ayanamsa (Lahiri)
        swe.set_sid_mode(swe.SIDM_LAHIRI)

    def get_zodiac_sign(self, longitude):
        """Get zodiac sign from longitude"""
        sign_num = int(longitude / 30)
        return self.ZODIAC_SIGNS[sign_num]

    def get_nakshatra(self, moon_longitude):
        """Get Nakshatra from Moon's longitude"""
        nakshatra_num = int((moon_longitude % 360) / 13.333333333333334)
        return self.NAKSHATRAS[nakshatra_num]

    def calculate_planetary_positions(self):
        """Calculate positions of all planets"""
        positions = {}

        for planet_id, planet_name in self.PLANETS.items():
            calc = swe.calc_ut(self.jd, planet_id)
            longitude = calc[0][0]

            # Apply ayanamsa for sidereal calculations
            ayanamsa = swe.get_ayanamsa_ut(self.jd)
            sidereal_longitude = (longitude - ayanamsa) % 360

            positions[planet_name] = {
                'longitude': round(sidereal_longitude, 2),
                'zodiac_sign': self.get_zodiac_sign(sidereal_longitude),
                'degree_in_sign': round(sidereal_longitude % 30, 2),
                'house': 0  # Will be calculated later
            }

        # Add Ketu (opposite of Rahu)
        rahu_long = positions['Rahu']['longitude']
        ketu_long = (rahu_long + 180) % 360
        positions['Ketu'] = {
            'longitude': round(ketu_long, 2),
            'zodiac_sign': self.get_zodiac_sign(ketu_long),
            'degree_in_sign': round(ketu_long % 30, 2),
            'house': 0
        }

        return positions

    def calculate_ascendant(self):
        """Calculate Ascendant (Lagna)"""
        houses = swe.houses_ex(
            self.jd,
            self.latitude,
            self.longitude,
            b'P'  # Placidus house system
        )

        ascendant_longitude = houses[1][0]  # Ascendant is the first element

        # Apply ayanamsa
        ayanamsa = swe.get_ayanamsa_ut(self.jd)
        sidereal_ascendant = (ascendant_longitude - ayanamsa) % 360

        return {
            'longitude': round(sidereal_ascendant, 2),
            'zodiac_sign': self.get_zodiac_sign(sidereal_ascendant),
            'degree_in_sign': round(sidereal_ascendant % 30, 2)
        }

    def calculate_houses(self):
        """Calculate all 12 houses"""
        houses_data = swe.houses_ex(
            self.jd,
            self.latitude,
            self.longitude,
            b'P'
        )

        ayanamsa = swe.get_ayanamsa_ut(self.jd)
        houses = {}

        for i, house_cusp in enumerate(houses_data[0][:12], start=1):
            sidereal_cusp = (house_cusp - ayanamsa) % 360
            houses[f'House_{i}'] = {
                'cusp_longitude': round(sidereal_cusp, 2),
                'zodiac_sign': self.get_zodiac_sign(sidereal_cusp)
            }

        return houses

    def generate_kundli(self):
        """Generate complete Kundli"""
        planetary_positions = self.calculate_planetary_positions()
        ascendant = self.calculate_ascendant()
        houses = self.calculate_houses()

        # Get Moon sign and Nakshatra
        moon_longitude = planetary_positions['Moon']['longitude']
        moon_sign = self.get_zodiac_sign(moon_longitude)
        nakshatra = self.get_nakshatra(moon_longitude)

        # Get Sun sign
        sun_sign = planetary_positions['Sun']['zodiac_sign']

        return {
            'planetary_positions': planetary_positions,
            'ascendant': ascendant,
            'houses': houses,
            'moon_sign': moon_sign,
            'sun_sign': sun_sign,
            'nakshatra': nakshatra,
            'ayanamsa': round(swe.get_ayanamsa_ut(self.jd), 2)
        }

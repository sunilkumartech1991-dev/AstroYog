# AstroYog - Astrology Consultation Platform

A complete production-ready astrology web application for the Indian market, similar to AstroTalk, with features including chat, voice/video consultations, Kundli generation, and payment gateway integration.

## Features

### User Features
- 🔐 User authentication (JWT-based)
- 💬 Real-time chat consultations with astrologers
- 📞 Voice calling integration (Twilio)
- 📹 Video calling integration (Agora)
- 📅 Booking system for scheduled consultations
- 🌟 Kundli/Birth chart generation (Vedic astrology)
- 🌙 Daily horoscopes
- 💰 Wallet system for seamless payments
- 💳 PayU payment gateway integration
- 🔔 Real-time notifications
- ⭐ Rating and review system

### Astrologer Features
- 📊 Comprehensive dashboard
- 💼 Profile management
- 🎯 Specialization and expertise settings
- ⏰ Availability management
- 💵 Earnings tracking
- 🏦 Payout requests
- 📈 Performance analytics

### Admin Features
- 👥 User and astrologer management
- ✅ Astrologer verification and approval
- 💸 Payment and payout management
- 📊 Platform analytics
- 🎨 Content management (horoscopes, specializations)

## Tech Stack

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL
- **Real-time**: Django Channels + Redis
- **Task Queue**: Celery + Redis
- **Authentication**: JWT (Simple JWT)
- **API Documentation**: Swagger (drf-yasg)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Context API / Redux Toolkit
- **UI Library**: Material-UI / Tailwind CSS
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Routing**: React Router v6

### Third-Party Services
- **Payment Gateway**: PayU
- **Video Calling**: Agora
- **Voice Calling**: Twilio
- **SMS**: Twilio
- **Email**: SMTP / AWS SES
- **Astrology Calculations**: Swiss Ephemeris (swisseph)

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/astroyog.git
cd astroyog
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your configuration
# Update database credentials, API keys, etc.

# Create PostgreSQL database
createdb astroyog_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (optional)
python manage.py loaddata fixtures/specializations.json

# Collect static files
python manage.py collectstatic --noinput
```

### 3. Start Redis Server

```bash
# On Windows (if using Redis for Windows):
redis-server

# On macOS/Linux:
redis-server /usr/local/etc/redis.conf
```

### 4. Start Celery Worker

Open a new terminal and run:

```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

celery -A astroyog worker -l info
```

### 5. Start Django Development Server

```bash
# HTTP Server
python manage.py runserver

# WebSocket Server (Daphne)
daphne -b 0.0.0.0 -p 8001 astroyog.asgi:application
```

Backend will be available at:
- API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
- API Documentation: http://localhost:8000/swagger
- WebSocket: ws://localhost:8001

### 6. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Project Structure

```
astroyog/
├── backend/
│   ├── astroyog/              # Main project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── celery.py
│   ├── users/                 # User management
│   ├── astrologers/           # Astrologer profiles and management
│   ├── consultations/         # Chat, call, video consultations
│   ├── payments/              # Payment gateway integration
│   ├── horoscope/             # Kundli generation and horoscopes
│   ├── notifications/         # Notification system
│   ├── media/                 # User uploads
│   ├── staticfiles/           # Static files
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # Context providers
│   │   ├── utils/             # Utility functions
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── docs/
    └── API_DOCUMENTATION.md
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/token/refresh/` - Refresh access token

### Users
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile
- `GET /api/users/wallet/transactions/` - Get wallet transactions

### Astrologers
- `GET /api/astrologers/` - List all astrologers
- `GET /api/astrologers/{id}/` - Get astrologer details
- `GET /api/astrologers/featured/` - Get featured astrologers
- `GET /api/astrologers/specializations/` - List specializations

### Consultations
- `POST /api/consultations/start/` - Start a consultation
- `POST /api/consultations/{id}/accept/` - Accept consultation (astrologer)
- `POST /api/consultations/{id}/end/` - End consultation
- `GET /api/consultations/` - List consultations
- `POST /api/consultations/bookings/` - Create a booking

### Payments
- `POST /api/payments/initiate/` - Initiate payment
- `GET /api/payments/` - List payment history

### Horoscope
- `POST /api/horoscope/kundli/generate/` - Generate Kundli
- `GET /api/horoscope/kundli/` - List user's Kundlis
- `GET /api/horoscope/daily/{zodiac_sign}/` - Get daily horoscope

## Environment Variables

### Backend (.env)
See `.env.example` for all required environment variables.

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8001
VITE_AGORA_APP_ID=your_agora_app_id
```

## Deployment

### Backend (Django)
1. Set `DEBUG=False` in production
2. Update `ALLOWED_HOSTS` with your domain
3. Use Gunicorn/uWSGI as application server
4. Use Nginx as reverse proxy
5. Use PostgreSQL for database
6. Use Redis for caching and Celery
7. Set up SSL/TLS certificates

### Frontend (React)
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or serve with Nginx
3. Update API URLs in environment variables

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
# or with pytest
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## PayU Integration Guide

1. Sign up at https://payu.in/
2. Get your Merchant Key and Salt
3. Update `.env` with credentials
4. For testing, use test cards from PayU documentation

## Agora Video Integration

1. Sign up at https://www.agora.io/
2. Create a project and get App ID and Certificate
3. Update `.env` with credentials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@astroyog.com or join our Slack channel.

## Acknowledgments

- Swiss Ephemeris for astrology calculations
- PayU for payment gateway
- Agora for video calling
- Twilio for voice calling and SMS

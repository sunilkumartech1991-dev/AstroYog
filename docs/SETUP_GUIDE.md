# AstroYog - Complete Setup Guide

This guide will walk you through setting up the AstroYog astrology consultation platform from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Setup](#system-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Admin Panel Access](#admin-panel-access)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis 6+** - [Download](https://redis.io/download/)

### Third-Party Services (for full functionality)
- **PayU Account** - [Sign up](https://payu.in/)
- **Agora Account** - [Sign up](https://www.agora.io/)
- **Twilio Account** - [Sign up](https://www.twilio.com/)

## System Setup

### 1. Install PostgreSQL

#### Windows
1. Download PostgreSQL installer
2. Run installer and follow the wizard
3. Remember the password you set for the postgres user
4. PostgreSQL service should start automatically

#### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Install Redis

#### Windows
1. Download Redis for Windows from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Extract and run redis-server.exe

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. Create PostgreSQL Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE astroyog_db;

# Create user (optional - or use postgres user)
CREATE USER astroyog_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE astroyog_db TO astroyog_user;

# Exit
\q
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment

#### Windows
```cmd
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Copy the example file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

Edit `.env` with your configuration:

```env
# Django Settings
SECRET_KEY=your-generated-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=astroyog_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# PayU (get from PayU dashboard)
PAYU_MERCHANT_KEY=your_merchant_key
PAYU_MERCHANT_SALT=your_merchant_salt
PAYU_MODE=test

# Agora (get from Agora console)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Twilio (get from Twilio console)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 7. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```bash
# Copy the example file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8001
VITE_AGORA_APP_ID=your_agora_app_id
```

## Running the Application

### Start Backend Services

#### Terminal 1: Redis (if not running as service)
```bash
redis-server
```

#### Terminal 2: Django HTTP Server
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

python manage.py runserver
```

Backend API available at: http://localhost:8000

#### Terminal 3: Django WebSocket Server (Daphne)
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

daphne -b 0.0.0.0 -p 8001 astroyog.asgi:application
```

WebSocket server available at: ws://localhost:8001

#### Terminal 4: Celery Worker
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

celery -A astroyog worker -l info
```

### Start Frontend

#### Terminal 5: React Development Server
```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:5173

## Admin Panel Access

1. Navigate to: http://localhost:8000/admin
2. Login with superuser credentials
3. Available admin sections:
   - **Users**: Manage users and wallet balances
   - **Astrologer Profiles**: Approve/manage Guruji's
   - **Consultations**: View all consultations
   - **Payments**: Monitor payments and transactions
   - **Bookings**: Manage bookings
   - **Reviews**: Moderate reviews
   - **Daily Horoscopes**: Create daily horoscopes

## API Documentation

Once the backend is running:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: could not connect to server: Connection refused
```
**Solution**: Ensure PostgreSQL service is running
```bash
# Windows: Check Services app
# macOS: brew services list
# Linux: sudo systemctl status postgresql
```

#### 2. Redis Connection Error
```
Error: Error 10061 connecting to localhost:6379
```
**Solution**: Ensure Redis is running
```bash
# Windows: Run redis-server.exe
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

#### 3. Module Import Error
```
ModuleNotFoundError: No module named 'module_name'
```
**Solution**: Install missing dependency
```bash
pip install module_name
```

#### 4. Port Already in Use
```
Error: port is already allocated
```
**Solution**: Change port or kill process using the port
```bash
# Find process on port 8000
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000

# Kill process
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

#### 5. CORS Errors in Frontend
**Solution**: Ensure backend CORS settings include frontend URL in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

## Next Steps

1. **Create Test Astrologer**: Register a user and create astrologer profile via admin
2. **Add Specializations**: Add astrology specializations via admin
3. **Test PayU**: Use PayU test cards for payment testing
4. **Configure Agora**: Set up video calling with Agora credentials
5. **Add Daily Horoscopes**: Create daily horoscopes for all zodiac signs

## Production Deployment

For production deployment, refer to:
- `docs/DEPLOYMENT_GUIDE.md` (to be created)
- Update `DEBUG=False` in `.env`
- Use production-grade WSGI server (Gunicorn)
- Set up Nginx as reverse proxy
- Use managed PostgreSQL and Redis services
- Configure SSL/TLS certificates

## Support

For issues and questions:
- Email: support@astroyog.com
- GitHub Issues: [https://github.com/yourusername/astroyog/issues](https://github.com/yourusername/astroyog/issues)

# ProManage Docker Setup Guide

This guide explains how to run ProManage using Docker and Docker Compose.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Google OAuth credentials (see below)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database
DB_PASSWORD=your_secure_password

# Session
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Google OAuth (Required - see setup below)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (adjust for production)
FRONTEND_URL=http://localhost
VITE_API_URL=http://localhost:3000/api
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Set application type to "Web application"
7. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
8. Copy the Client ID and Client Secret to your `.env` file

### 3. Run with Docker Compose

Start all services:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3000)
- Frontend (port 80)

### 4. Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432 (internal use only)

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Reset everything (including database)
```bash
docker-compose down -v
docker-compose up -d --build
```

## Production Deployment

### 1. Update Environment Variables

For production, update your `.env` file:

```env
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
DB_PASSWORD=strong_random_password
SESSION_SECRET=strong_random_session_secret
```

### 2. SSL/TLS Setup

For production, you'll need to set up SSL certificates. You can:

1. Use a reverse proxy like Nginx or Traefik
2. Use Cloudflare or similar CDN
3. Use Let's Encrypt certificates

Example Nginx configuration for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your_cert.pem;
    ssl_certificate_key /etc/ssl/private/your_key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. Security Checklist

- [ ] Changed all default passwords
- [ ] Set strong SESSION_SECRET
- [ ] Configured Google OAuth redirect URLs for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configured firewall rules
- [ ] Set up database backups
- [ ] Configured log rotation
- [ ] Set NODE_ENV=production
- [ ] Reviewed and limited exposed ports

## Database Management

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres promanage > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres promanage < backup.sql
```

### Access Database CLI

```bash
docker-compose exec postgres psql -U postgres promanage
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is healthy: `docker-compose ps`
- View backend logs: `docker-compose logs backend`
- Verify environment variables in `.env`

### Google OAuth errors
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check redirect URIs match in Google Cloud Console
- Ensure FRONTEND_URL is correct

### Database connection errors
- Verify DB_PASSWORD matches in all services
- Check if postgres service is running: `docker-compose ps postgres`
- View postgres logs: `docker-compose logs postgres`

### Port conflicts
If ports 80, 3000, or 5432 are already in use:

Edit `docker-compose.yml` to change port mappings:
```yaml
ports:
  - "8080:80"  # Frontend (change 8080 to available port)
  - "3001:3000"  # Backend (change 3001 to available port)
```

## Development vs Production

### Development Mode

For development with hot reload:

1. Don't use Docker for frontend
2. Run frontend locally with `npm run dev`
3. Use Docker only for backend and database:

```bash
docker-compose up -d postgres backend
```

### Production Mode

Use the full Docker Compose setup:

```bash
docker-compose up -d
```

## Monitoring

### Health Checks

- Backend health: http://localhost:3000/health
- Frontend: http://localhost

### Resource Usage

```bash
docker stats
```

## Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Review backend README: `backend/README.md`
- Verify Google OAuth setup
- Ensure all environment variables are set correctly

# VPS Deployment Guide

## Production Environment Setup

### 1. Environment Variables

Create `.env` files in both root and backend directories:

**Backend `.env`:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promanage
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Session (CRITICAL for production)
SESSION_SECRET=generate_a_very_long_random_string_here
COOKIE_DOMAIN=.yourdomain.com  # Include subdomain if needed

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Important Session Configuration:**
- `SESSION_SECRET`: Generate a secure random string (minimum 32 characters)
- `COOKIE_DOMAIN`: Set to your domain (e.g., `.example.com` for `api.example.com`)
- If using HTTPS (required for production), ensure `NODE_ENV=production`

### 2. Database Setup

Run the migration to create the activity logs table:

```bash
psql -U postgres -d promanage -f backend/src/db/migrations/002_activity_logs.sql
```

This creates the `activity_logs` table to track all user activities.

### 3. SSL/HTTPS Configuration

**CRITICAL:** For session cookies to work in production, you MUST use HTTPS.

Update your Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
npm install
npm run build
pm2 start dist/index.js --name promanage-backend

# Start frontend (if not using static build)
cd ../
npm install
pm2 start npm --name promanage-frontend -- run dev

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Testing the Deployment

1. **Check Backend Logs:**
```bash
pm2 logs promanage-backend
```

Look for:
- "Server running on port 3000"
- Database connection messages
- No session or cookie errors

2. **Test Signup:**
- Open browser DevTools → Network tab
- Try to sign up
- Check the response for the `Set-Cookie` header
- Verify the cookie is being set with `Secure`, `HttpOnly`, and `SameSite` flags

3. **Check Database:**
```bash
psql -U postgres -d promanage

# Verify user was created
SELECT * FROM users;

# Verify activity is being logged
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

### 6. Common Issues

#### Signup fails with "Signup failed"
- Check backend logs: `pm2 logs promanage-backend`
- Common causes:
  - Database connection failed
  - `SESSION_SECRET` not set
  - `COOKIE_DOMAIN` misconfigured
  - Not using HTTPS in production

#### Sessions not persisting
- Ensure `COOKIE_DOMAIN` matches your domain
- Verify HTTPS is enabled
- Check browser console for cookie warnings
- Ensure `NODE_ENV=production`

#### CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check Nginx configuration is proxying headers correctly

### 7. Activity Monitoring

View all user activities:

```sql
-- Recent activity
SELECT u.email, al.action, al.details, al.created_at 
FROM activity_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Activity by action type
SELECT action, COUNT(*) as count
FROM activity_logs
GROUP BY action
ORDER BY count DESC;

-- Activity by user
SELECT u.email, COUNT(*) as actions
FROM activity_logs al
JOIN users u ON al.user_id = u.id
GROUP BY u.email
ORDER BY actions DESC;
```

### 8. Security Checklist

- ✅ HTTPS enabled
- ✅ `SESSION_SECRET` is strong and unique
- ✅ `COOKIE_DOMAIN` properly configured
- ✅ `NODE_ENV=production` set
- ✅ Database password is secure
- ✅ Rate limiting enabled (already configured)
- ✅ Input validation enabled (Zod schemas)
- ✅ Activity logging tracking all actions

### 9. Backup Strategy

Backup the database regularly:

```bash
# Create backup
pg_dump -U postgres promanage > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U postgres promanage < backup_20231215_120000.sql
```

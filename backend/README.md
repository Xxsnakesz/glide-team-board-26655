# ProManage Backend

Backend API for ProManage - A Trello-style project management application.

## Tech Stack

- Node.js + Express.js
- PostgreSQL (pure SQL via `pg`)
- Socket.IO (real-time collaboration)
- Passport.js (Google OAuth)
- TypeScript

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create PostgreSQL database:
```bash
createdb promanage
```

Run migrations:
```bash
npm run db:migrate
```

Seed database (optional):
```bash
npm run db:seed
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### 5. Run Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add member
- `DELETE /api/boards/:id/members/:userId` - Remove member

### Lists
- `GET /api/lists/:boardId` - Get lists for board
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Cards
- `GET /api/cards/:listId` - Get cards for list
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/:id/move` - Move card

### Comments
- `GET /api/comments/:cardId` - Get comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Attachments
- `POST /api/attachments` - Upload file
- `GET /api/attachments/:cardId` - Get attachments
- `DELETE /api/attachments/:id` - Delete attachment

## Socket.IO Events

### Client → Server
- `join-board` - Join board room
- `leave-board` - Leave board room
- `card-update` - Update card
- `card-move` - Move card
- `list-update` - Update list

### Server → Client
- `card-updated` - Card was updated
- `card-moved` - Card was moved
- `list-updated` - List was updated

## Deployment

### VPS Deployment

1. Install Node.js and PostgreSQL on your VPS
2. Clone repository
3. Set up environment variables
4. Run database migrations
5. Build and start:
```bash
npm run build
npm start
```

### Using PM2 (recommended)

```bash
npm install -g pm2
pm2 start dist/index.js --name promanage-api
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Security Notes

- All routes except `/health` and auth routes require authentication
- Rate limiting: 100 requests per 15 minutes per IP
- CORS enabled for frontend URL only
- Session cookies are HTTP-only and secure in production
- Input validation using Zod
- SQL injection protection via parameterized queries

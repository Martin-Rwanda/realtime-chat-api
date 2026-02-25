# Realtime Chat API 🚀

A production-grade real-time chat and notification API built with NestJS, PostgreSQL, Redis, and WebSockets.

## 🌐 Live Demo

- **API Base URL:** https://realtime-chat-api-ai8s.onrender.com/api/v1
- **Swagger Docs:** https://realtime-chat-api-ai8s.onrender.com/api/docs

---

## 🏗️ Architecture

This project follows **Clean Architecture** principles:
```
src/
├── core/                    # Domain layer (entities, repository interfaces)
├── application/             # Use cases (business logic)
├── infrastructure/          # External services (DB, Redis, Cloudinary, WebSockets)
└── presentation/            # Controllers, DTOs, Guards
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS + TypeScript |
| Database | PostgreSQL (Neon) + TypeORM |
| Cache / Queue | Redis (Upstash) + BullMQ |
| Real-time | Socket.io WebSockets |
| File Storage | Cloudinary |
| Email | Nodemailer + Gmail SMTP |
| Auth | JWT (Access + Refresh Token Rotation) |
| Deployment | Docker + Render |
| CI/CD | GitHub Actions |
| Testing | Jest (Unit + E2E) |

---

## ✨ Features

- 🔐 **Authentication** — Register, Login, Refresh Token Rotation, Logout
- 👤 **User Profiles** — Avatar upload/delete via Cloudinary
- 🏠 **Rooms** — Public/Private rooms with owner, admin, member roles
- 💬 **Direct Messages** — Private 1-on-1 conversations
- 📨 **Messages** — Send, edit, soft delete, read receipts, cursor pagination
- ⚡ **Real-time** — WebSocket events for messages, typing indicators, online status
- 🔔 **Notifications** — In-app + email notifications for offline users
- 📦 **Background Jobs** — BullMQ queues for email and Cloudinary cleanup
- 🧪 **Tests** — 8 unit tests + 11 E2E tests

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/Martin-Rwanda/realtime-chat-api.git
cd realtime-chat-api
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
# App
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=realtime_chat

# JWT
JWT_ACCESS_SECRET=your_strong_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_strong_secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_app_password
```

**4. Start Docker services (PostgreSQL + Redis)**
```bash
npm run docker:dev
```

**5. Run migrations**
```bash
npm run migration:run
```

**6. Start the app**
```bash
npm run start:dev
```

**7. Open Swagger docs**
```
http://localhost:3000/api/docs
```

---

## 🧪 Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📡 API Endpoints

### Auth
```
POST /api/v1/auth/register    Register new user
POST /api/v1/auth/login       Login
POST /api/v1/auth/refresh     Refresh tokens
POST /api/v1/auth/logout      Logout
```

### Users
```
GET    /api/v1/users/me           Get my profile
PATCH  /api/v1/users/me           Update username
POST   /api/v1/users/me/avatar    Upload avatar
DELETE /api/v1/users/me/avatar    Delete avatar
```

### Rooms
```
POST   /api/v1/rooms              Create room
GET    /api/v1/rooms              List public rooms
GET    /api/v1/rooms/:id          Get room
GET    /api/v1/rooms/:id/members  Get room members
POST   /api/v1/rooms/:id/join     Join room
POST   /api/v1/rooms/:id/leave    Leave room
DELETE /api/v1/rooms/:id          Delete room (owner only)
POST   /api/v1/rooms/dm           Create/get DM room
```

### Messages
```
POST   /api/v1/messages           Send message
GET    /api/v1/messages           Get messages (cursor pagination)
PATCH  /api/v1/messages/:id       Edit message
DELETE /api/v1/messages/:id       Delete message (soft)
POST   /api/v1/messages/:id/read  Mark as read
```

### Notifications
```
GET    /api/v1/notifications          Get my notifications
PATCH  /api/v1/notifications/:id/read Mark as read
PATCH  /api/v1/notifications/read-all Mark all as read
```

---

## ⚡ WebSocket Events

Connect to: `wss://realtime-chat-api-ai8s.onrender.com/chat`
```javascript
const socket = io('wss://realtime-chat-api-ai8s.onrender.com/chat', {
  auth: { token: 'your_jwt_access_token' }
});
```

### Events you can listen to:
```
message:new        New message in room
message:edited     Message was edited
message:deleted    Message was deleted
user:online        User came online
user:offline       User went offline
user:typing        User is typing
user:stop-typing   User stopped typing
room:user-joined   User joined room
room:user-left     User left room
notification:new   New notification
```

### Events you can emit:
```
user:typing        { roomId: 'uuid' }
user:stop-typing   { roomId: 'uuid' }
```

---

## 🔄 CI/CD Pipeline
```
feature/* → PR → dev → PR → master
                              ↓
                         GitHub Actions
                         1. Lint
                         2. Build
                         3. Unit Tests
                         4. Run Migrations
                         5. E2E Tests
                         6. Deploy to Render ✅
```

---

## 🐳 Docker
```bash
# Start development services (PostgreSQL + Redis)
npm run docker:dev

# Stop services
npm run docker:dev:down
```

---

## 📁 Project Structure
```
src/
├── core/
│   ├── entities/          # Domain entities (User, Room, Message...)
│   └── repositories/      # Abstract repository interfaces
├── application/
│   ├── auth/              # Auth use cases
│   ├── chat/              # Room & message use cases
│   ├── users/             # User use cases
│   ├── notifications/     # Notification service
│   └── jobs/              # Job producer service
├── infrastructure/
│   ├── database/          # TypeORM entities, migrations, repositories
│   ├── redis/             # Redis/Bull configuration
│   ├── bull/              # Job processors
│   ├── cloudinary/        # File upload service
│   └── websockets/        # Socket.io gateway
├── presentation/
│   ├── auth/              # Auth controller, guards, decorators
│   ├── users/             # Users controller
│   ├── chat/              # Rooms & messages controllers
│   └── notifications/     # Notifications controller
└── shared/
    ├── config/            # App configuration
    ├── decorators/        # Custom decorators
    ├── enums/             # Shared enums
    └── filters/           # Global exception filter
```

---

## 👨‍💻 Author

**Jean Martin Ntezi**
- GitHub: [@Martin-Rwanda](https://github.com/Martin-Rwanda)

---

## 📄 License

MIT
# News API

A robust Node.js REST API for a news management system with user authentication, role-based access control, and background email processing.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   API Server    │    │  Email Worker   │
│                 │    │                 │    │                 │
│  - Frontend     │◄──►│  - Express.js   │    │  - BullMQ       │
│  - Mobile App   │    │  - Controllers  │    │  - Nodemailer   │
│  - API Client   │    │  - Middleware   │    │  - Background   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │
                       │                 │    │                 │
                       │  - User Data    │    │  - Job Queue    │
                       │  - News Data    │    │  - Caching      │
                       │  - Prisma ORM   │    │  - Sessions     │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod
- **File Upload**: express-fileupload
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### DevOps & Infrastructure

- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (production)
- **Environment**: dotenv
- **Build Tool**: TypeScript Compiler
- **Deployment**: VPS(coolify)

## 📁 Project Structure

```
Newsapi/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── news.controller.ts
│   │   └── profile.controller.ts
│   ├── routes/              # API route definitions
│   │   ├── user.route.ts
│   │   ├── news.route.ts
│   │   └── profile.route.ts
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── verifyRole.middleware.ts
│   ├── utils/               # Utility functions
│   │   ├── Logger.ts
│   │   ├── sendmail.ts
│   │   ├── ratelimit.ts
│   │   └── helper.utils.ts
│   ├── validations/         # Input validation schemas
│   │   ├── userAuthValidator.ts
│   │   └── newsValidation.ts
│   ├── workers/             # Background job processors
│   │   └── emailWorker.ts
│   ├── queue/               # Job queue setup
│   │   └── emailqueue.ts
│   ├── db/                  # Database configuration
│   │   └── db.config.ts
│   ├── redisClient/         # Redis client setup
│   │   └── client.redis.ts
│   ├── uploads/             # File storage
│   │   ├── images/          # Profile pictures
│   │   └── coverimgs/       # News cover images
│   └── index.ts             # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── logs/                    # Application logs
├── docker-compose.yml       # Development containers
├── docker-compose.prod.yml  # Production containers
├── Dockerfile              # Container definition
└── package.json            # Dependencies & scripts
```

## 🔄 Workflow

### User Registration & Authentication Flow

1. **Registration**: User submits credentials → Validation → Password hashing → Database storage → Welcome email queued
2. **Login**: Credentials verification → JWT token generation → Secure cookie setting
3. **Authentication**: JWT token validation → User identification → Route access control

### News Management Flow

1. **Create News**: Authentication → File upload (cover image) → Validation → Database storage
2. **Read News**: Public access → Pagination → Image serving
3. **Update/Delete**: Authentication → Authorization (owner/admin) → Database modification

### Background Email Processing

1. **Email Trigger**: User action (registration, news creation, etc.)
2. **Queue Job**: Email data added to Redis queue via BullMQ
3. **Worker Processing**: Separate worker process consumes jobs → Sends emails via SMTP
4. **Logging**: Success/failure logging for monitoring

## 🛠️ API Endpoints

### Authentication

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `GET /api/user/profile` - Get user profile (protected)

### News Management

- `GET /api/news` - Get all news (public)
- `POST /api/news` - Create news (protected)
- `PUT /api/news/:id` - Update news (protected, owner/admin)
- `DELETE /api/news/:id` - Delete news (protected, owner/admin)

### Profile Management

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile with image upload

### Utilities

- `GET /api/user/todos` - Cached external API example
- `GET /uploads/images/:filename` - Serve profile images
- `GET /uploads/coverimgs/:filename` - Serve cover images

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis server
- Docker (optional)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd newsAPI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/newsapi_db"
   JWT_SECRET_KEY="your-secret-key"
   BACKEND_URL="http://localhost:8000"
   GMAIL_PASSWORD="your-app-password"
   GMAIL_CLIENT_MAIL="your-email@gmail.com"
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   ```

4. **Database setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Redis server**

   ```bash
   redis-server
   ```

6. **Run the application**

   ```bash
   # Start API server
   npm run dev

   # Start email worker (in separate terminal)
   npm run worker:dev
   ```

### Docker Development

1. **Start all services**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Express rate limiter to prevent abuse
- **CORS Protection**: Configured cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📊 Database Schema

### User Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String
  email     String   @unique
  password  String
  role      Role     // ADMIN | USER
  profile   String?  // Profile image path
  createdAt DateTime @default(now())
  News      News[]   // One-to-many relationship
}
```

### News Model

```prisma
model News {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   String
  coverImg  String?  // Cover image path
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start API server in development mode
npm run worker:dev       # Start email worker in development mode

# Production
npm run build           # Build TypeScript to JavaScript
npm run start:api       # Start production API server
npm run start:worker    # Start production email worker
```

## 📝 Logging

The application uses Winston for comprehensive logging:

- **combined.log**: All application logs
- **error.log**: Error-level logs only
- **exceptions.log**: Uncaught exceptions
- **rejections.log**: Unhandled promise rejections

## 🔧 Configuration

### Environment Variables

| Variable            | Description                  | Default                 |
| ------------------- | ---------------------------- | ----------------------- |
| `DATABASE_URL`      | PostgreSQL connection string | Required                |
| `JWT_SECRET_KEY`    | JWT signing secret           | Required                |
| `BACKEND_URL`       | API base URL                 | `http://localhost:8000` |
| `GMAIL_PASSWORD`    | Gmail app password           | Required                |
| `GMAIL_CLIENT_MAIL` | Gmail sender address         | Required                |
| `REDIS_HOST`        | Redis server host            | `localhost`             |
| `REDIS_PORT`        | Redis server port            | `6379`                  |

### File Upload Configuration

- **Profile Images**: Stored in `src/uploads/images/`
- **Cover Images**: Stored in `src/uploads/coverimgs/`
- **Supported Formats**: PNG, JPG, JPEG
- **Access**: Public via `/uploads/` endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Redis Connection Error**

   - Start Redis server: `redis-server`
   - Check Redis host/port configuration

3. **Email Not Sending**

   - Verify Gmail app password
   - Check SMTP configuration
   - Ensure email worker is running

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure supported file formats

### Logs Location

- Development: Console output
- Production: `logs/` directory

---

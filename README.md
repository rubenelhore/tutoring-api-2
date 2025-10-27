# Tutoring API 2.0 - Enhanced Platform

An advanced full-stack tutoring platform with Express, TypeScript, PostgreSQL, OpenAI integration, and modern frontend. This enhanced version provides a complete solution for managing tutoring sessions with AI-powered responses and an intuitive user interface.

> **Note**: This is the enhanced version of the original [tutoring-api](https://github.com/rubenelhore/tutoring-api) project.

## Features

### Backend (Enhanced)
- 🔐 **Authentication System** - User registration and login with JWT tokens
- 🤖 **AI Integration** - OpenAI GPT integration for tutoring responses
- 📚 **Session Management** - Create and retrieve tutoring sessions
- 🗄️ **PostgreSQL Database** - Robust data persistence with connection pooling
- 🔒 **Protected Routes** - JWT-based authentication middleware
- 🐳 **Docker Support** - Easy deployment with Docker and Docker Compose
- ✅ **Testing Suite** - Comprehensive tests with Jest
- 📝 **TypeScript** - Full type safety and modern JavaScript features

### Frontend (Coming Soon)
- ⚛️ **React Frontend** - Modern UI built with React + TypeScript
- 🎨 **Tailwind CSS** - Beautiful, responsive design
- 🔄 **State Management** - Redux or Context API for state handling
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **Real-time Updates** - Live session updates
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📊 **Dashboard** - Analytics and session history
- 🔔 **Notifications** - Real-time alerts and updates

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16+
- **AI**: OpenAI API
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

### Frontend (Planned)
- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit / Context API
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **UI Components**: Headless UI / Radix UI

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- OpenAI API Key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rubenelhore/tutoring-api-2.git
cd tutoring-api-2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Database
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tutoring_db

# JWT
JWT_SECRET=your-secret-key-change-in-production

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=3000
NODE_ENV=development
```

### 4. Set up the database

Make sure PostgreSQL is running, then the database will be initialized automatically on first run.

## Usage

### Development Mode

Run with automatic reload on file changes:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Run Tests

```bash
npm test
```

Watch mode for tests:

```bash
npm run test:watch
```

## Docker Setup

### Using Docker Compose (Recommended)

Start both the API and PostgreSQL database:

```bash
docker-compose up
```

Stop the services:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f api
```

### Building Docker Image Only

```bash
docker build -t tutoring-api .
```

## API Endpoints

### Authentication

#### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Sessions (Protected Routes)

All session endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

#### Create Session
```bash
POST /sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Explain how photosynthesis works"
}
```

Response:
```json
{
  "message": "Session created successfully",
  "session": {
    "id": 1,
    "user_id": 1,
    "question": "Explain how photosynthesis works",
    "response": "Photosynthesis is a process...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get All Sessions
```bash
GET /sessions?limit=10&offset=0
Authorization: Bearer <token>
```

Response:
```json
{
  "sessions": [...],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25,
    "hasMore": true
  }
}
```

#### Get Single Session
```bash
GET /sessions/:id
Authorization: Bearer <token>
```

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
tutoring-api-2/
├── backend/                   # Backend API (Current)
│   ├── src/
│   │   ├── config.ts              # Configuration management
│   │   ├── database.ts            # PostgreSQL connection & initialization
│   │   ├── index.ts               # Main entry point
│   │   ├── middlewares/
│   │   │   └── auth.ts            # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication routes
│   │   │   └── sessions.ts        # Session management routes
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   └── utils/
│   │       └── jwt.ts             # JWT & password utilities
│   ├── tests/
│   │   └── auth.test.ts           # Authentication tests
│   ├── .env.example               # Environment variables template
│   ├── Dockerfile                 # Docker image configuration
│   ├── jest.config.js             # Jest test configuration
│   ├── package.json               # NPM dependencies and scripts
│   └── tsconfig.json              # TypeScript configuration
├── frontend/                  # React Frontend (Coming Soon)
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API service layer
│   │   ├── store/                 # State management
│   │   ├── types/                 # TypeScript types
│   │   └── App.tsx                # Main App component
│   ├── public/                    # Static assets
│   ├── package.json               # Frontend dependencies
│   └── vite.config.ts             # Vite configuration
├── .gitignore                 # Git ignore rules
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # Project documentation
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tutoring Sessions Table
```sql
CREATE TABLE tutoring_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `password` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `tutoring_db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Testing

The project includes comprehensive test coverage using Jest and Supertest.

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Test files are located in the `tests/` directory.

## Security

- Passwords are hashed using bcryptjs with salt rounds
- JWT tokens are used for authentication
- Environment variables for sensitive data
- CORS enabled with configurable origins
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Roadmap

### Phase 1: Backend Foundation ✅
- [x] Authentication system
- [x] Session management
- [x] OpenAI integration
- [x] Docker setup
- [x] Testing suite

### Phase 2: Frontend Development 🚧
- [ ] React app setup with Vite
- [ ] Authentication pages (Login/Register)
- [ ] Dashboard with session history
- [ ] Real-time chat interface
- [ ] User profile management
- [ ] Dark mode support

### Phase 3: Advanced Features 📋
- [ ] Real-time collaboration
- [ ] File upload and sharing
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Admin dashboard

## Author

Rubén Elhore

## Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Powered by [OpenAI](https://openai.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Inspired by FastAPI patterns and best practices

## Related Projects

- [tutoring-api](https://github.com/rubenelhore/tutoring-api) - Original version (Backend only)

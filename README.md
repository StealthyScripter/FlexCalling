# FlexCalling

International calling app using Twilio to make affordable calls from the USA to Kenya.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 📱 Make international calls from USA to Kenya at affordable rates
- 👤 User authentication and authorization
- 📞 Contact management
- 📊 Call history and tracking
- 💰 Transparent pricing ($0.05/minute to Kenya)
- 🔒 Secure token-based authentication
- 📱 Cross-platform mobile app (iOS & Android) using Expo
- 🎯 Rate limiting and security middleware
- 📝 Comprehensive logging system

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express** - REST API
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Twilio** - Voice calling infrastructure
- **JWT** - Authentication
- **Jest** - Testing framework

### Frontend
- **React Native** with **Expo** - Mobile app framework
- **Expo Router** - Navigation
- **TypeScript** - Type safety
- **Async Storage** - Local data persistence
- **Expo Secure Store** - Secure credentials storage

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher) or **Docker**
- **Twilio Account** - [Sign up here](https://www.twilio.com/try-twilio)
- **Expo CLI** (optional, but recommended for mobile development)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/StealthyScripter/FlexCalling.git
cd FlexCalling
```

### 2. Install dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install:all

# Or install individually
npm install              # Root dependencies
cd server && npm install # Server dependencies
cd client && npm install # Client dependencies
```

## ⚙️ Configuration

### Server Configuration

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `server/.env`:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d

   # Database Configuration
   DATABASE_URL=postgresql://flexcalling:flexcalling_dev_password@localhost:5432/flexcalling?schema=public

   # Twilio Configuration (get from https://console.twilio.com)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_SECRET=your_api_secret_here
   TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890

   # Public URLs (for Twilio webhooks)
   PUBLIC_BASE_URL=https://your-domain.com
   BASE_URL=http://localhost:3000

   # Security
   BCRYPT_ROUNDS=10

   # Rate Limiting
   RATE_LIMITING_ENABLED=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS
   CORS_ORIGIN=*
   ```

### Client Configuration

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `client/.env`:

   ```env
   # API Configuration
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```

### Database Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL database
npm run db:setup

# This will:
# 1. Start PostgreSQL in Docker
# 2. Run database migrations
# 3. Seed the database with initial data
```

#### Manual Setup

1. Create a PostgreSQL database named `flexcalling`
2. Update the `DATABASE_URL` in `server/.env`
3. Run migrations:
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

## 🏃 Running the Application

### Development Mode

#### Run both server and client concurrently:
```bash
npm run dev
```

#### Or run separately:

**Server:**
```bash
npm run dev:server
# Server will run on http://localhost:3000
```

**Client:**
```bash
npm run dev:client
# Expo dev server will start
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code for physical device
```

### Production Mode

#### Build the application:
```bash
npm run build
```

#### Start the server:
```bash
cd server
npm start
```

## 🧪 Testing

### Run all tests:
```bash
npm test
```

### Run server tests:
```bash
npm run test:server

# Or specific test suites
cd server
npm run test:services  # Service tests
npm run test:routes    # Route tests
npm run test:coverage  # With coverage report
```

### Run client tests:
```bash
npm run test:client

# Or with watch mode
cd client
npm run test:watch
```

## 📁 Project Structure

```
FlexCalling/
├── client/                 # React Native mobile app
│   ├── app/               # Expo Router screens
│   ├── components/        # Reusable components
│   ├── services/          # API and service layer
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── __tests__/         # Client tests
├── server/                # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   ├── types/         # TypeScript types
│   │   └── __tests__/     # Server tests
│   └── prisma/            # Database schema and migrations
└── package.json           # Root package configuration
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/balance` - Get account balance

### Contact Endpoints

- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create a new contact
- `PUT /api/contacts/:id` - Update a contact
- `DELETE /api/contacts/:id` - Delete a contact

### Call Endpoints

- `POST /api/calls/initiate` - Initiate a call
- `GET /api/calls/history` - Get call history
- `GET /api/calls/:id` - Get call details

### Token Endpoints

- `POST /api/token/generate` - Generate Twilio access token

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Twilio](https://www.twilio.com/) for voice calling infrastructure
- [Expo](https://expo.dev/) for the mobile app framework
- [Prisma](https://www.prisma.io/) for the database ORM

## 📞 Support

If you encounter any issues or have questions, please file an issue on the [GitHub issue tracker](https://github.com/StealthyScripter/FlexCalling/issues).

---

Made with ❤️ by the FlexCalling Team

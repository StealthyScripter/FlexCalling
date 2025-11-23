# Contributing to FlexCalling

Thank you for your interest in contributing to FlexCalling! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher) or Docker
- A Twilio account for testing
- Git

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/FlexCalling.git
   cd FlexCalling
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/StealthyScripter/FlexCalling.git
   ```

4. **Install dependencies**

   ```bash
   npm run install:all
   ```

5. **Set up environment variables**

   ```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your configuration

   # Client
   cd ../client
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Set up the database**

   ```bash
   # From the root directory
   npm run db:setup
   ```

7. **Start the development servers**

   ```bash
   # Run both server and client
   npm run dev

   # Or run separately
   npm run dev:server  # Server only
   npm run dev:client  # Client only
   ```

## Development Workflow

1. **Create a new branch**

   Always create a new branch for your work:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

   Branch naming conventions:
   - `feature/` - for new features
   - `fix/` - for bug fixes
   - `docs/` - for documentation updates
   - `refactor/` - for code refactoring
   - `test/` - for adding or updating tests

2. **Make your changes**

   - Write clean, readable code
   - Follow the coding standards (see below)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   # Run all tests
   npm test

   # Run server tests
   npm run test:server

   # Run client tests
   npm run test:client

   # Run with coverage
   cd server && npm run test:coverage
   ```

4. **Commit your changes**

   Follow the commit guidelines (see below)

5. **Keep your branch up to date**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**

   Go to the repository on GitHub and create a pull request from your branch.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type unless absolutely necessary
- Use meaningful variable and function names

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Maximum 100 characters (soft limit)
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_CASE` for constants

### Backend (Server)

- Follow RESTful API design principles
- Use middleware for cross-cutting concerns (auth, validation, error handling)
- Keep route handlers thin - business logic belongs in services
- Use Prisma for all database operations
- Log errors using the logger service, not `console.log`

### Frontend (Client)

- Follow React Native best practices
- Use functional components and hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

### File Organization

```
server/src/
  ├── routes/       # API route definitions
  ├── services/     # Business logic
  ├── middleware/   # Express middleware
  ├── config/       # Configuration
  └── types/        # TypeScript types

client/
  ├── app/          # Expo Router screens
  ├── components/   # Reusable components
  ├── services/     # API and service layer
  ├── utils/        # Utility functions
  └── types/        # TypeScript types
```

## Testing

### Writing Tests

- Write tests for all new features
- Ensure tests are isolated and don't depend on external state
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### Test Coverage

- Aim for at least 80% code coverage for new code
- Critical business logic should have higher coverage

### Running Tests

```bash
# All tests
npm test

# Server tests only
cd server && npm test

# Client tests only
cd client && npm test

# Watch mode (for development)
cd server && npm run test:watch

# Coverage report
cd server && npm run test:coverage
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, etc.

### Examples

```bash
# Feature
feat(api): add endpoint for call history filtering

# Bug fix
fix(auth): resolve token expiration issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(database): simplify user query logic

# Tests
test(contacts): add integration tests for contact CRUD
```

### Commit Message Guidelines

- Use the imperative mood ("add" not "added" or "adds")
- Keep the subject line under 50 characters
- Capitalize the subject line
- Don't end the subject line with a period
- Separate subject from body with a blank line
- Wrap the body at 72 characters
- Use the body to explain what and why, not how

## Pull Request Process

1. **Before submitting**

   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new functionality
   - Rebase on the latest main branch
   - Ensure your code follows the coding standards

2. **PR Title**

   Follow the same format as commit messages:
   ```
   feat(scope): description
   fix(scope): description
   ```

3. **PR Description**

   Include:
   - A clear description of the changes
   - The motivation for the changes
   - Any breaking changes
   - Screenshots for UI changes
   - Link to related issues

   Template:
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Motivation
   Why are these changes needed?

   ## Changes
   - Change 1
   - Change 2

   ## Testing
   How have these changes been tested?

   ## Screenshots (if applicable)
   Add screenshots here

   ## Breaking Changes
   List any breaking changes

   ## Related Issues
   Closes #123
   ```

4. **Code Review**

   - Be responsive to feedback
   - Make requested changes promptly
   - Ask questions if something is unclear
   - Be respectful and constructive

5. **After Approval**

   - Squash commits if requested
   - Wait for a maintainer to merge

## Project Structure

### Server Architecture

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Seed data
├── src/
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration
│   ├── types/            # TypeScript types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
└── __tests__/            # Tests
```

### Client Architecture

```
client/
├── app/                  # Expo Router screens
├── components/           # Reusable UI components
├── services/            # API clients and services
├── utils/               # Utility functions
├── types/               # TypeScript types
├── hooks/               # Custom React hooks
├── constants/           # Constants and theme
└── __tests__/           # Tests
```

## Common Tasks

### Adding a New API Endpoint

1. Define the route in `server/src/routes/`
2. Add validation middleware
3. Implement business logic in a service
4. Add tests in `__tests__/routes/`
5. Update API documentation in README

### Adding a New Screen

1. Create a new file in `client/app/`
2. Add necessary components
3. Connect to API services
4. Add tests in `__tests__/`
5. Update navigation if needed

### Database Changes

1. Update `prisma/schema.prisma`
2. Create a migration: `npm run db:migrate`
3. Update TypeScript types in `src/types/`
4. Update seed data if needed
5. Test the migration thoroughly

## Questions?

If you have questions or need help:

- Open an issue with the `question` label
- Check existing issues and documentation
- Reach out to the maintainers

## License

By contributing to FlexCalling, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to FlexCalling!

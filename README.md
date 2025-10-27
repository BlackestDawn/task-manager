# Task Manager

A full-stack task management application built as a capstone/milestone project for frontend education, incorporating self-paced backend learning to create a complete, production-ready solution.

## 📑 Table of Contents

- [Project Context](#-project-context)
- [Project Structure](#-project-structure)
  - [Package Overview](#package-overview)
- [Technologies & Tools](#-technologies--tools)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Running with Docker](#running-with-docker)
  - [Adding Sample Data](#adding-sample-data)
- [Package Architecture](#-package-architecture)
- [Project Goals](#-project-goals)
- [License](#-license)

## 📚 Project Context

This project serves as a comprehensive demonstration of modern web development practices, combining:

- **Frontend Development (Primary Focus)**: Implementing advanced React patterns, state management, and user experience design using Next.js and modern tooling
- **Backend Development (Self-Paced Learning)**: Building a robust API server with authentication, authorization, and database integration using Bun and Drizzle ORM
- **Full-Stack Integration**: Connecting frontend and backend with type-safe APIs, shared validation logic, and permission-based access control

## 🏗️ Project Structure

The project is organized as a monorepo with three distinct packages:

```
task-manager/
├── docker/
|   └── db
|       ├── init                   # Containerized database initialization scripts
│       ├── reset-db.sql           # SQL file for reseting database
│       └── sample_data.sql        # SQL file with sample data
│
├── packages/
│   ├── frontend/          # Next.js application (@task-manager/frontend)
│   │   ├── src/
│   │   │   ├── app/           # Next.js app directory (routes)
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks (permissions, API)
│   │   │   └── lib/           # Utility functions and configurations
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/           # Hono API server (@task-manager/backend)
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers and middlewares
│   │   │   ├── db/            # Database schema, connection and migrations
│   │   │   ├── config.ts      # Config object
│   │   │   └── index.ts       # Server entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── common/            # Shared types and validation (@task-manager/common)
│       ├── src/
│       │   ├── classes/       # Error code classes
│       │   ├── types/         # Zod schemas, infered types, and validators
│       │   ├── permissions/   # CASL permission definitions and ability builder
│       │   └── functions/     # Various helper functions
│       ├── package.json
│       └── tsconfig.json
│
├── sample_data.sh         # Generate sample data
├── reset-db.sh            # Reset database to initial state
├── docker-manager.sh      # Docker management script
├── docker-compose.yml
├── package.json
└── README.md
```

### Package Overview

#### **Frontend** (`@task-manager/frontend`)
The client-facing application built with Next.js and modern React patterns.

**Key Responsibilities:**
- User interface and experience
- Client-side routing and state management
- Permission-based rendering with CASL
- Form validation and error handling

**Technologies:**
- **Next.js**: React framework with server-side rendering
- **Tailwind CSS**: Utility-first CSS framework for styling
- **CASL React**: Permission and authorization on the frontend
- **Custom Hooks**: Reusable logic for permissions and API interactions
- **TypeScript**: Strict type safety with explicit imports
- **ESLint**: Enforced code quality with strict rules (no implicit `any` types)

#### **Backend** (`@task-manager/backend`)
The API server handling business logic, data persistence, and authentication.

**Key Responsibilities:**
- RESTful API endpoints
- Database operations and migrations
- Authentication and session management
- Business logic and validation

**Technologies:**
- **Bun**: Fast all-in-one JavaScript runtime and toolkit
- **Hono**: Lightweight, ultrafast web framework for the edge
- **Drizzle ORM**: TypeScript ORM for type-safe database queries
- **TypeScript**: End-to-end type safety

#### **Common** (`@task-manager/common`)
Shared code between frontend and backend ensuring consistency and reducing duplication.

**Key Responsibilities:**
- Single source of truth for data structures
- Validation logic shared across packages
- Permission definitions and ability checks

**Technologies:**
- **Zod**: Schema validation and type inference (exclusive schema definition)
- **CASL**: Authorization library for defining user permissions
- **TypeScript**: Exported types inferred from Zod schemas

**Exports:**
- Zod schemas for all data structures
- TypeScript types inferred from schemas
- Validation functions for every defined type
- Type lists for enumerations
- CASL ability definitions

## 🛠️ Technologies & Tools

### Core Technologies
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime, bundler, and package manager
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Frontend Framework**: [Next.js](https://nextjs.org/) - React framework with SSR/SSG
- **Backend Framework**: [Hono](https://hono.dev/) - Lightweight, ultrafast web framework
- **Database ORM**: [Drizzle](https://orm.drizzle.team/) - TypeScript-first ORM

### Key Libraries
- **Validation**: [Zod](https://zod.dev/) - Schema validation with TypeScript inference
- **Authorization**: [CASL](https://casl.js.org/) - Isomorphic authorization library
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### Development Tools
- **Package Manager**: Bun (workspaces)
- **Linting**: ESLint with strict TypeScript rules
- **Type Checking**: TypeScript compiler

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js (v18.0.0 or higher) - for tooling compatibility

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Copy example env files
cp packages/backend/env.example packages/backend/.env
cp packages/frontend/env.example packages/frontend/.env
```

**Note:** Database migrations are automatically applied when the backend starts, so no manual migration step is required. It will also create an admin user ('admin:admin123') if no other users exists.

### Development

Start all packages in development mode:
```bash
bun run dev
```

Or run individual packages:
```bash
# Common, needs building so frontend/backend can import from it
bun run build:common

# Frontend only
bun run dev:frontend

# Backend only
bun run dev:backend
```

### Running with Docker

The project includes a Docker setup for easy deployment. Use the `docker-manager.sh` script to manage Docker containers:

```bash
# Start all services (frontend, backend, database)
./docker-manager.sh start

# Stop all services
./docker-manager.sh stop

# Restart all services
./docker-manager.sh restart

# View logs
./docker-manager.sh logs

# Remove all containers and volumes
./docker-manager.sh clean
```

Alternatively, use Docker Compose directly:
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Adding Sample Data

To populate the database with sample data for testing and development:

#### Option 1: Using the sample_data.sh script
```bash
# Make sure the backend is running first
bun run dev:backend

# In another terminal, run the sample data script
./sample_data.sh
```

#### Option 2: Using the docker-manager.sh script
```bash
# If running with Docker, use the docker-manager script
./docker-manager.sh db:sample
```

The sample data includes:
- Users with different site-level permission
- Groups with members of different group-level permissions
- Tasks with various statuses and finish dates
- Assignment relationships

## 📦 Package Architecture

### Dependency Flow
```
frontend  →  common  ←  backend
```

- **Frontend** imports types, schemas, and validation from **common**
- **Backend** imports types, schemas, and validation from **common**
- **Common** has no dependencies on other packages

### Type Safety
All type definitions originate in the **common** package as Zod schemas, ensuring:
- Single source of truth for data structures
- Automatic TypeScript type inference
- Runtime validation matches compile-time types
- No type drift between frontend and backend

### Permission Model
CASL abilities defined in **common** are used by:
- **Backend**: Enforce permissions on API endpoints
- **Frontend**: Conditionally render UI elements and enable/disable features

## 🎯 Project Goals

This project demonstrates proficiency in:

1. **Modern Frontend Development**
   - Component-based architecture
   - Server-side rendering and static generation
   - Responsive design with Tailwind CSS
   - Permission-based UI rendering

2. **Backend Development**
   - RESTful API design
   - Database modeling and relationships
   - Authentication and authorization
   - Type-safe ORM usage

3. **Full-Stack Integration**
   - Shared type definitions
   - End-to-end type safety
   - Consistent validation logic
   - Monorepo architecture

4. **Professional Development Practices**
   - Monorepo management
   - Code quality enforcement
   - Separation of concerns
   - Scalable architecture

## 📝 License

This project is created for educational purposes as part of a frontend development capstone project.
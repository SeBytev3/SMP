# Services Marketplace Platform (WIP)

A web platform connecting service providers (plumbers, electricians, locksmiths) with customers who need their services, featuring admin-approved provider registrations, rich provider profiles, in-app messaging, and a commission-based business model, standardized strictly on Spanish.

## Software Architecture

The Services Marketplace Platform (SMP) follows a **Monorepo** structure, housing both the frontend and backend in a single repository for simplified dependency management and shared context.

### Architectural Style: Layered Monolith

The system is designed as a **Layered Monolith**. This choice balances development speed with structural clarity, allowing for a clean separation of concerns without the operational complexity of microservices.

- **Frontend (Client):** A Single Page Application (SPA) built with React and TypeScript, focused on providing a responsive user experience standardized in Spanish.
- **Backend (Server):** A Node.js/Express API that manages business logic, authentication, and data persistence.
- **Database:** A relational PostgreSQL database managed via Prisma ORM to ensure data integrity and type safety.

### Why this Architecture?

1.  **Simplicity & Speed:** For the current scale, a monolith allows for faster iterations, easier testing (E2E flows), and straightforward deployment.
2.  **Type Safety:** Using TypeScript across the entire stack (React + Node.js + Prisma) minimizes runtime errors and improves developer productivity.
3.  **Scalability:** The layered approach (Routes -> Controllers -> Services -> Prisma) makes it easy to split specific domains into microservices in the future if needed.
4.  **Consistency:** A single repository ensures that API changes and frontend updates stay in sync.

### Diagrams (C4 Model)

El diseño arquitectónico de la plataforma sigue el estándar internacional de documentación **C4 Model** (Contexto, Contenedores, Componentes y Código). Todo el flujo y las explicaciones están completamente en español.

#### 1. Diagrama de Contexto del Sistema (Level 1)
Representa cómo los diferentes actores y roles interactúan con la plataforma y cómo esta se apoya en servicios externos de infraestructura.

```mermaid
graph TB
    subgraph Usuarios [Roles de Usuario]
        Cliente["👥 Cliente (Usuario Final)<br>Busca proveedores, envía solicitudes y deja reseñas"]
        Proveedor["🛠️ Proveedor de Servicios<br>Crea perfil, sube portafolio y atiende solicitudes"]
        Admin["👑 Administrador del Sistema<br>Modera proveedores, gestiona categorías y tarifas"]
    end

    SMP["💻 Services Marketplace Platform (SMP)<br>Monolito principal que procesa la lógica de negocio y expone la API REST"]

    subgraph Sistemas_Externos [Infraestructura & Servicios Externos]
        SMTP["📧 Servidor SMTP (Correo)<br>Gestiona notificaciones por email de seguridad y registro"]
    end

    Cliente -->|Usa la plataforma para buscar e interactuar| SMP
    Proveedor -->|Gestiona perfil y atiende solicitudes| SMP
    Admin -->|Aprueba registros y gestiona categorías| SMP

    SMP -->|Envía correos electrónicos| SMTP
```

#### 2. Diagrama de Contenedores (Level 2)
Detalla los contenedores de software que componen la base de código del monorepo, los límites físicos de ejecución (Docker Compose) y los protocolos de comunicación.

```mermaid
graph TB
    subgraph Cliente_Navegador [Entorno del Navegador]
        ClienteReact["⚛️ Cliente Web (React SPA)<br>Interfaz de usuario SPA construida con React y TypeScript, compilada vía Vite 6. Servida en español."]
    end

    subgraph Plataforma_Contenedores [Ecosistema del Servidor (Docker Compose)]
        ServidorAPI["⚙️ Servidor API (Express / Node.js)<br>Monolito por capas escrito en TypeScript que gestiona la lógica de negocio y JWT."]
        BaseDatos["🗄️ Base de Datos Relacional (PostgreSQL)<br>Almacena la información de usuarios, perfiles, solicitudes, reseñas, notificaciones y mensajes."]
    end

    ClienteReact -->|Llamadas HTTP/REST con cookies HTTP-only JWT en puerto 4000| ServidorAPI
    ServidorAPI -->|Consultas y Escrituras vía Prisma ORM en puerto 5432| BaseDatos
```

#### 3. Diagrama de Componentes del Backend (Level 3)
Muestra la organización interna de componentes y capas dentro del contenedor del **Servidor API (Express / Node.js)**.

```mermaid
graph TB
    ClienteReact["⚛️ Cliente React (SPA)"]

    subgraph Backend_SMP [Componentes Internos del Servidor API]
        Rutas["🛣️ Rutas (Express Router)<br>Define endpoints y enruta solicitudes HTTP."]
        
        subgraph Filtros_Seguridad [Capa de Middlewares]
            RateLimiter["🛑 Rate Limiters<br>Protege endpoints contra abusos (auth, mensajes)."]
            AuthMiddleware["🔑 Auth & Roles Middleware<br>Verifica tokens JWT en cookies HTTP-only y valida roles de usuario."]
            ValidatorZod["📋 Validator Middleware (Zod)<br>Sanea y valida esquemas de datos entrantes."]
        end
        
        subgraph Controladores_SMP [Capa de Controladores]
            AuthController["👤 Auth Controller<br>Gestiona registro, login y logout."]
            ProviderController["🛠️ Provider Controller<br>Gestiona perfiles, portafolio y búsquedas."]
            AdminController["👑 Admin Controller<br>Gestiona aprobaciones, desactivaciones y categorías."]
            RequestController["📝 Request Controller<br>Gestiona flujo de solicitudes y estados."]
            ReviewController["⭐ Review Controller<br>Gestiona calificaciones y comentarios."]
            MessageController["💬 Message Controller<br>Gestiona chat y notificaciones."]
        end
        
        subgraph Servicios_Negocio [Capa de Servicios de Lógica de Negocio]
            AuthService["🔑 Auth Service<br>Cifrado bcrypt de contraseñas y gestión de JWT."]
            ProviderService["🛠️ Provider Service<br>Lógica de perfiles y búsqueda con filtros."]
            AdminService["👑 Admin Service<br>Flujos de aprobaciones de proveedores y auditorías."]
            RequestService["📝 Request Service<br>Control de estados de solicitudes y notificaciones."]
            ReviewService["⭐ Review Service<br>Cálculo matemático de reputación y promedios."]
            MessageService["💬 Message Service<br>Manejo de mensajería y persistencia de alertas."]
        end
        
        PrismaORM["💾 Prisma ORM (Client)<br>Capa relacional type-safe generada a partir de schema.prisma."]
    end

    BaseDatos[("🗄️ PostgreSQL Database")]

    ClienteReact -->|1. Petición HTTP/REST| Rutas
    Rutas -->|2. Filtra y Valida| RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> ValidatorZod
    
    ValidatorZod -->|3. Procesa HTTP| Controladores_SMP
    
    AuthController --> AuthService
    ProviderController --> ProviderService
    AdminController --> AdminService
    RequestController --> RequestService
    ReviewController --> ReviewService
    MessageController --> MessageService
    
    Servicios_Negocio -->|4. Ejecuta Query| PrismaORM
    PrismaORM -->|5. SQL Query| BaseDatos
```

## Tech Stack

- **Frontend:** React 19, TypeScript, **Vite 6** (Build Tool & Dev Server), Tailwind CSS, React Router 7.
- **Backend:** Node.js 24, Express, TypeScript, Prisma ORM, JWT.
- **Database:** PostgreSQL 14 (Dockerized).
- **DevOps:** Docker, Docker Compose.

## Project Structure & Components

The project is divided into two main services, coordinated via Docker Compose.

### 🎨 Client (Frontend) - Powered by Vite 6
Located in `/client`. It uses **Vite** for optimized building and extremely fast development (HMR).

#### Key Components:
- **`src/context/AuthContext.tsx`**: Manages the global authentication state, token persistence, and user sessions.
- **`src/api/axios.ts`**: Configured Axios instance for API communication with automatic credential handling.
- **`src/data/colombia.ts`**: Static data provider for Colombian departments and cities used in location selectors.
- **`src/pages/`**:
    - `Register.tsx`: User onboarding flow (Customer vs. Provider).
    - `CompleteProfile.tsx`: Dynamic form for providers featuring Colombian location logic and category selection.
    - `Login.tsx`: Secure entry point to the platform.
    - `AdminDashboard.tsx`: Administrative interface for provider moderation.

### ⚙️ Server (Backend) - Layered Architecture
Located in `/server`. Follows a clean separation of concerns.

#### Core Layers:
- **Controllers**: Handle HTTP requests and response formatting (e.g., `provider.controller.ts`).
- **Services**: Contain the core business logic and rules (e.g., `auth.service.ts`).
- **Validators (Zod)**: Strict input validation and sanitization for all endpoints.
- **Prisma Schema**: The single source of truth for the database structure.

## Current Maturity Level
Contrary to initial planning focusing only on the backend, the project has evolved into a **Full-Stack Functional Prototype**.
- **Frontend:** Fully responsive, integrated with the API, and featuring complex business logic (Colombian localization, multi-step registration).
- **Backend:** Production-ready authentication, robust data validation, and automated database seeding.

## Quick Start (with Docker - Recommended)

The entire platform can be launched with a single command. Ensure you have Docker and Docker Compose installed.

```bash
# Start all services (Database, Backend, Frontend)
docker-compose up --build -d
```

Once running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api-docs

### Default Credentials
All users share the password: `Prueba123*`
- **Admin:** `admin@marketplace.com`
- **Provider:** `sebesp@gmail.com`
- **Customer:** `cguzman@gmail.com`

## Manual Development Setup

```bash
# Install dependencies
npm install

# Start development servers (both backend and frontend)
npm run dev
```

## Documentation

- [SPEC.md](plans/0000-services-marketplace/SPEC.md) - Full specification document
- [PLAN.md](plans/0000-services-marketplace/PLAN.md) - Implementation plan

## Important Note before Starting

Before running the project with Docker, you must create a `.env` file in the `server/` directory. You can use the provided example:

```bash
cp server/.env.example server/.env
```

## License

Private - All rights reserved

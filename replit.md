# Overview

This is a full-stack materials and quality control management application built for manufacturing environments. The system allows users to manage different types of materials (raw materials, packaging, final products, artwork, instructions) with comprehensive quality control tracking. The application features a modern web interface with real-time monitoring capabilities and a robust backend API for material lifecycle management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API architecture with standardized endpoints
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with Vite integration for seamless development experience

## Data Model
- **Materials Schema**: Comprehensive material tracking with fields for identification (id, name, code), categorization (type, category), quality control (status, score), inventory (stock), and audit trails (timestamps)
- **Quality Control**: Three-tier status system (approved, pending, failed) with numerical scoring
- **Material Types**: Five distinct categories - raw materials, packaging materials, final products, artwork, and instructions/checklists

## Database Integration
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL configured through Neon Database serverless connection
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Current State**: Memory storage implementation ready for database migration

## Development Tools
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Code Quality**: ESBuild for production bundling and TypeScript compilation
- **Development Environment**: Replit-optimized with cartographer and runtime error handling
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

## UI/UX Design
- **Design System**: Consistent component library with custom theming
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Navigation**: Sidebar-based navigation with collapsible menu system
- **Data Visualization**: Status cards for quality metrics and tabbed material management
- **Accessibility**: Radix UI primitives ensure ARIA compliance and keyboard navigation

## Key Features
- **Material Management**: CRUD operations for all material types with category-specific workflows
- **Quality Control**: Status tracking with approval workflows and quality scoring
- **Real-time Monitoring**: Live updates for material status and quality metrics
- **Search and Filter**: Category-based filtering and material type organization
- **Inventory Tracking**: Stock level management integrated with material records
- **RFID Inventory Tracking**: Real-time RFID scanner monitoring across warehouse zones — readers (Zebra, Impinj, Alien, Honeywell), tag registry, inbound/outbound movement log, zone activity map. Routes: `/rfid-tracking`. API: `/api/rfid/*` (zones, readers, tags, events, stats)
- **Finance Management**: Full AP/AR, manufacturing cost tracking, GL journals, budget, and ledger insights. Routes: `/finance-setup`, `/finance-transactions`, `/finance-manufacturing`, `/finance-ledger`
- **Audit Trail**: Creation and update timestamps for compliance tracking

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18+ with TypeScript, React DOM, and modern hooks
- **TanStack React Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight routing library for single-page application navigation

## UI and Styling
- **Shadcn/ui**: Pre-built accessible component library
- **Radix UI**: Headless UI primitives for complex components (dialogs, dropdowns, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation for forms and API
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Database and ORM
- **Drizzle ORM**: Type-safe ORM for PostgreSQL operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver
- **Drizzle Kit**: Database migration and schema management tools

## Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: JavaScript/TypeScript bundler for production
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Tailwind CSS integration

## Replit Integration
- **@replit/vite-plugin-cartographer**: Development environment integration
- **@replit/vite-plugin-runtime-error-modal**: Error handling in development

## Utility Libraries
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional CSS class utility
- **date-fns**: Modern date utility library
- **nanoid**: URL-safe unique string ID generator
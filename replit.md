# Overview

This is a modern energy trading intelligence platform called EnergiAI that combines real-time market data analysis with AI-powered insights. The application serves as a comprehensive dashboard for energy traders, featuring live market monitoring, risk assessment, AI-driven recommendations, and an interactive chat interface with specialized trading agents. Built as a full-stack web application, it targets energy commodities like natural gas, crude oil, power prices, and carbon credits.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component system for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a dark energy trading theme
- **State Management**: TanStack React Query for server state management and caching
- **Real-time Communication**: WebSocket integration for live market data updates and AI insights

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with WebSocket support for real-time features
- **Development Setup**: Vite for development server with hot module replacement
- **Build Process**: ESBuild for production bundling with platform-specific optimizations

## Database & Data Layer
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL configured for energy trading data (positions, market data, AI insights)
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Schema**: Comprehensive trading schema including users, positions, market data, AI insights, chat messages, risk metrics, and activity logs

## AI & External Services
- **AI Provider**: OpenAI GPT-4o for market analysis, risk assessment, and conversational AI
- **Market Data**: Alpha Vantage API integration with fallback to realistic simulated data
- **AI Agents**: Specialized agent system including Market Analyzer, Risk Manager, and News Correlator
- **Analysis Features**: Real-time market condition analysis, risk scoring, and automated insight generation

## Real-time Features
- **WebSocket Server**: Custom WebSocket implementation for live updates
- **Live Data**: Real-time market price updates, AI insight notifications, and chat messaging
- **Auto-refresh**: Automatic data refresh intervals for market data (30-second intervals)
- **Event System**: Custom event system for triggering UI updates based on WebSocket messages

## Authentication & Security
- **Session Management**: PostgreSQL session storage with connect-pg-simple
- **User System**: Basic user authentication with role-based access (trader role default)
- **API Security**: CORS configuration and request logging middleware

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Database schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

## AI & External APIs
- **OpenAI API**: GPT-4o model for market analysis and conversational AI
- **Alpha Vantage API**: Real-time and historical market data for energy commodities
- **WebSocket (ws)**: Real-time bidirectional communication

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives (20+ components)
- **wouter**: Lightweight React router
- **class-variance-authority**: Utility for component variant management
- **tailwindcss**: Utility-first CSS framework

## Development & Build Tools
- **vite**: Fast development server and build tool
- **@vitejs/plugin-react**: React integration for Vite
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
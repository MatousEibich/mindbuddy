# MindBuddy Web Application

The web implementation of MindBuddy, providing a browser-based chat interface.

## Overview

This is the web application for MindBuddy, built with:

- React 19
- Vite
- Local storage for data persistence
- Tailwind CSS for styling

## Features

- Chat interface with an AI companion
- User profile management
- Conversation style customization
- Core fact management
- Persistent conversation history

## Getting Started

### Prerequisites

- Node.js (v18+)
- PNPM package manager

### Installation

```bash
# Install dependencies from the root of the monorepo
pnpm install

# Build the core package first
cd packages/core
pnpm build

# Return to the web app
cd ../../apps/web
```

### Running the App

```bash
# Development mode
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Architecture

The web application:

1. Uses the `@mindbuddy/core` package for business logic
2. Implements a simple `localStorage`-based persistence layer
3. Provides a clean, responsive UI for desktop and mobile browsers

### Key Files

- `src/App.tsx`: Main component with chat functionality
- `src/profileUtils.ts`: Profile management utilities
- `src/init.ts`: Initialization for storage and other systems

## Configuration

The app is configured through:

- Environment variables (for API keys)
- The profile interface (for user preferences)
- The central configuration in `@mindbuddy/core`

## Development

### Adding New Features

1. Understand the existing components and architecture
2. Make changes to the UI components as needed
3. If business logic changes are required, make them in the core package

### Testing

Run the app in development mode and test your changes:

```bash
pnpm dev
```

## License

ISC License

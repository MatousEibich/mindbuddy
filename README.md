# MindBuddy

MindBuddy is a cross-platform AI companion application with a modular architecture that supports both web and mobile platforms.

## Overview

MindBuddy provides a personalized chat experience powered by Large Language Models (LLMs). It remembers user preferences, conversation history, and adapts its tone and style to the user's preferences.

## Project Structure

MindBuddy is organized as a monorepo using PNPM workspaces with the following structure:

```
mindbuddy/
├── apps/                   # Applications
│   ├── web/                # Web application
│   └── mobile/             # React Native mobile application
├── packages/               # Shared packages
│   ├── core/               # Core functionality and business logic
│   └── ui/                 # Shared UI components
├── pnpm-workspace.yaml     # Workspace configuration
└── package.json            # Root package configuration
```

## Core Architecture

The core package (`@mindbuddy/core`) serves as the foundation of MindBuddy, implementing platform-agnostic business logic using a modular architecture:

### Storage System

Handles persistent storage with a platform-agnostic interface:

- `StorageInterface`: Abstract interface for data persistence
- `AsyncStorageAdapter`: Mobile implementation using AsyncStorage
- `LocalStorageAdapter`: Web implementation using localStorage

### Memory System

Manages conversation history for LLMs:

- `StorageMemory`: LangChain memory implementation using the storage system

### Chat System

Manages the conversation flow:

- `buildMindBuddyChain`: Creates a LangChain chain for processing messages
- Message formatting and handling via the LLM

### Profile Management

Handles user profiles and preferences:

- Profile storage and retrieval
- Core fact management
- Conversation style preferences

## Applications

### Web Application

The web application (`apps/web`) is built with:

- React 19
- Vite
- Local storage persistence
- Tailwind CSS for styling

### Mobile Application

The mobile application (`apps/mobile`) is built with:

- React Native
- Expo
- AsyncStorage for persistence

## Development

### Prerequisites

- Node.js (v18+)
- PNPM package manager

### Setup

```bash
# Install dependencies
pnpm install

# Build core package
cd packages/core
pnpm build

# Start web app
cd ../../apps/web
pnpm dev

# Start mobile app
cd ../mobile
pnpm start
```

### Core Package Development

The core package includes testing utilities to verify functionality:

- `examples/test-modular-components.ts`: Tests storage and memory components
- `src/test-storage.ts`: Tests storage adapters

Run tests with:

```bash
cd packages/core
pnpm build
node dist/test-storage.js
```

## Architecture Details

### Modular Design

MindBuddy uses a modular architecture that separates concerns:

1. **Core Logic**: Platform-agnostic implementation in the core package
2. **UI Layer**: Platform-specific UI implementations
3. **Storage**: Abstract interface with platform-specific adapters
4. **Configuration**: Centralized config management

### Data Flow

1. User interacts with the UI
2. UI calls core functions
3. Core processes requests through the LLM
4. Responses are stored in the storage system
5. UI updates with the response

### Extensibility

The modular architecture allows for:

- New storage adapters without changing business logic
- New UI implementations on different platforms
- Easy testing of components in isolation
- Future extension of LLM capabilities

## Configuration

MindBuddy is configured through:

- User profiles stored in persistent storage
- Environment variables for API keys
- Centralized configuration in `config.ts`

## License

ISC License 
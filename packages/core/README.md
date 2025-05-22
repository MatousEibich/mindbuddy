# @mindbuddy/core

Core functionality package for MindBuddy, providing platform-agnostic business logic.

## Overview

This package implements the core functionality of MindBuddy, including:

- LLM integration with LangChain
- Storage abstraction
- Memory management
- Profile handling

## Architecture

### Storage System

The storage system provides a platform-agnostic way to persist data:

```
storage/
├── StorageInterface.ts   # Abstract interface for data persistence
├── AsyncStorageAdapter.ts # Mobile implementation
├── LocalStorageAdapter.ts # Web implementation
└── index.ts              # Exports and utility functions
```

Usage example:

```typescript
import { StorageInterface, setDefaultStorage } from '@mindbuddy/core';

// Initialize with the appropriate adapter
const storage = new LocalStorageAdapter();
setDefaultStorage(storage);

// Use the storage
await storage.saveProfile(profile);
const savedProfile = await storage.loadProfile();
```

### Memory System

The memory system manages conversation history for LangChain:

```
memory/
├── StorageMemory.ts     # LangChain memory implementation
└── index.ts             # Exports and utilities
```

Usage example:

```typescript
import { StorageMemory, initializeMemory } from '@mindbuddy/core';

// Initialize memory with profile
const memory = initializeMemory(userProfile);

// Memory is used internally by the chain
```

### Chain System

The chain system manages conversations with the LLM:

```typescript
import { buildMindBuddyChain, Profile } from '@mindbuddy/core';

// Create a chain for this profile
const chain = await buildMindBuddyChain(profile);

// Use the chain to get responses
const response = await chain.invoke({ query: "Hello, how are you?" });
console.log(response.text);
```

## Configuration

The core package is configured through:

- `config.ts`: Central configuration constants
- Environment variables for API keys

```typescript
// Example configuration settings
export const STORAGE = {
  MSG_KEY: "mindbuddy.messages.v1",
  PROFILE_KEY: "mindbuddy.profile.v1",
  HARD_LIMIT: 40,
  DEFAULT_LOAD_COUNT: 20
};
```

## Logging

Debug logging is provided through a utility:

```typescript
import { createLogger } from '@mindbuddy/core';

const logger = createLogger('COMPONENT_NAME');
logger.debug('Debug message', { optional: 'data' });
logger.info('Info message');
logger.error('Error message', error);
```

## Testing

The package includes tools for testing components:

```bash
# Build the package
pnpm build

# Run all tests
pnpm test

# Run storage tests
pnpm test:storage
```

## Integration

### With Web Applications

```typescript
import { LocalStorageAdapter, setDefaultStorage } from '@mindbuddy/core';

// Initialize in your web app
const storage = new LocalStorageAdapter();
setDefaultStorage(storage);
```

### With React Native Applications

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAdapter, setDefaultStorage } from '@mindbuddy/core';

// Initialize in your React Native app
const storage = new AsyncStorageAdapter(AsyncStorage);
setDefaultStorage(storage);
```

## Development

The package is built with TypeScript and requires building before use:

```bash
pnpm build
```

## Dependencies

- `@langchain/core`: LangChain functionality
- `@langchain/openai`: OpenAI integration
- `langchain`: Core LangChain library
- `dotenv`: Environment variable management
- `uuid`: For generating unique IDs
- `@react-native-async-storage/async-storage`: AsyncStorage types

## License

ISC License 
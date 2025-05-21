# MindBuddy Mobile Application

The mobile implementation of MindBuddy, providing a native chat interface for iOS and Android.

## Overview

This is the mobile application for MindBuddy, built with:

- React Native
- Expo
- AsyncStorage for data persistence
- React Native's styling system

## Features

- Native chat interface with an AI companion
- User profile management
- Conversation style customization
- Core fact management
- Persistent conversation history

## Getting Started

### Prerequisites

- Node.js (v18+)
- PNPM package manager
- Expo Go app (for development on physical devices)
- Android Studio / Xcode (for emulators)

### Installation

```bash
# Install dependencies from the root of the monorepo
pnpm install

# Build the core package first
cd packages/core
pnpm build

# Return to the mobile app
cd ../../apps/mobile
```

### Running the App

```bash
# Start the Expo development server
pnpm start

# For iOS
pnpm ios

# For Android
pnpm android
```

## Architecture

The mobile application:

1. Uses the `@mindbuddy/core` package for business logic
2. Implements AsyncStorage for data persistence
3. Provides a native mobile UI for Android and iOS

### Key Files

- `App.tsx`: Main component and entry point
- `index.ts`: Application initialization

## Configuration

The app is configured through:

- Environment variables (for API keys)
- The profile interface (for user preferences)
- The central configuration in `@mindbuddy/core`
- Expo configuration in `app.json`

## Development

### Adding New Features

1. Understand the existing components and architecture
2. Make changes to the UI components as needed
3. If business logic changes are required, make them in the core package

### Testing

Test the app on both iOS and Android platforms:

```bash
# Using Expo Go on a physical device
pnpm start

# Using iOS simulator
pnpm ios

# Using Android emulator
pnpm android
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

ISC License 
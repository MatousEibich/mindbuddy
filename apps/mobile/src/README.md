# MindBuddy Mobile App Source

This directory contains the source code for the MindBuddy mobile application.

## Directory Structure

- **components/**: UI Components
  - `ChatInput.tsx`: Text input component for sending messages
  - `ChatMessage.tsx`: Message bubble component for displaying chat messages

- **utils/**: Utility functions 
  - `chainWrapper.ts`: Implementation of the OpenAI API integration

- **App.tsx**: Main application component
- **index.ts**: Exports all components and utilities
- **types.d.ts**: Type definitions for external modules

## Architecture

The application follows a modular architecture with:

1. **Component Layer**: Reusable UI components in the components directory
2. **Application Layer**: Main App component that manages state and business logic
3. **Utility Layer**: Helper functions and external API integrations

## API Integration

The app uses the `chainWrapper.ts` utility to interact with the OpenAI API directly, 
without requiring Node.js-specific libraries that would not work in React Native.

## Environment Variables

Environment variables are loaded from a `.env` file using the `react-native-dotenv` package.
The `OPENAI_API_KEY` variable is required for the application to function. 
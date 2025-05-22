// Main app component
export { default as App } from './App';

// Components
export { default as ChatInput } from './components/ChatInput';
export { default as ChatMessage } from './components/ChatMessage';
export type { Message } from './components/ChatMessage';

// Utilities
export { createRealChain } from './utils/chainWrapper'; 
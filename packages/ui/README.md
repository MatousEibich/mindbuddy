# @mindbuddy/ui

Shared UI components for MindBuddy web and mobile applications.

## Overview

This package provides shared UI components that can be used across different MindBuddy platforms. The components are built to be platform-agnostic where possible, with platform-specific adaptations when necessary.

## Components

### ChatApp

The `ChatApp` component is the main chat interface for MindBuddy:

```typescript
import { ChatApp } from '@mindbuddy/ui';

// Use the component
<ChatApp profile={userProfile} />
```

## Usage

### In Web Application

```tsx
import { ChatApp } from '@mindbuddy/ui';
import { Profile } from '@mindbuddy/core';

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Load profile, etc.
  
  return (
    <div>
      {profile && <ChatApp profile={profile} />}
    </div>
  );
}
```

### In Mobile Application

```tsx
import { ChatApp } from '@mindbuddy/ui';
import { Profile } from '@mindbuddy/core';

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Load profile, etc.
  
  return (
    <SafeAreaView>
      {profile && <ChatApp profile={profile} />}
    </SafeAreaView>
  );
}
```

## Development

To add new components to this package:

1. Create the component in the `src` directory
2. Export it from `src/index.ts`
3. Build the package

```bash
pnpm build
```

## Dependencies

- `@mindbuddy/core`: Core functionality
- React
- Platform-specific UI libraries as needed

## License

ISC License 
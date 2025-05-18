# @mindbuddy/core

Core LLM functionality for MindBuddy.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the workspace root with your OpenAI API key:
```bash
OPENAI_API_KEY=your_key_here
```

## Usage

```typescript
import { runMindBuddy, Profile } from "@mindbuddy/core";

const profile: Profile = {
  name: "User",
  pronouns: "they/them",
  style: "middle",
  core_facts: [
    { id: 1, text: "Some fact about the user" }
  ]
};

const reply = await runMindBuddy(profile, "", "Hello!");
console.log(reply);
```

## Build

```bash
pnpm build
``` 
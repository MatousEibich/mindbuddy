# MindBuddy Core Tests

This directory contains tests for the MindBuddy core package.

## Available Tests

- `test.ts`: Basic functionality tests
- `test-storage.ts`: Storage system tests

## Running Tests

From the core package directory, run:

```bash
# Run basic tests
npm run test

# Run storage tests
npm run test:storage
```

## Test Structure

The tests use a simple approach with basic utilities and logging.
They do not use a test framework like Jest to keep dependencies minimal.

## Adding New Tests

When adding new tests:

1. Create a new test file in this directory
2. Update imports to use relative paths from the tests directory (e.g., `import { something } from "../src/module"`)
3. Add a new npm script to `package.json` to run the test 
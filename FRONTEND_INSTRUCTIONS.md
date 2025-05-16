# Running the MindBuddy Frontend

This document contains instructions for setting up and running the MindBuddy frontend, which is built using Expo/React Native.

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js and npm installed. If not, you can download them from [nodejs.org](https://nodejs.org/).

## Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory based on `.env.example`:
   ```
   cp .env.example .env
   ```
   
   Then edit the `.env` file to set the correct API URL for your local backend server.

## Running the App

1. Start the development server:
   ```
   npm start
   ```
   
   This will open the Expo developer tools in your browser.

2. Run on different platforms:
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For web: `npm run web`

## Folder Structure

- `app/screens/`: Contains screen components
- `app/components/`: Contains reusable UI components
- `app/navigation/`: Contains navigation configuration

## Environment Variables

- `API_URL`: URL of the backend API (default: http://localhost:8000) 
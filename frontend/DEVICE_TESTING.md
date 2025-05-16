# Testing MindBuddy on Real Devices

This document explains how to test the MindBuddy mobile app on a real device using Expo Go.

## Implementation Approach

For reliable real device testing, we've chosen to use hardcoded API URLs rather than environment variables. This ensures a consistent experience across different Expo versions and platform implementations.

The API URL is directly set in:
- `src/utils/api.js` (or `api.ts`)
- `app/screens/HomeScreen.js`
- `app/screens/ConnectivityScreen.js`

## Testing the App on a Device

1. **Start the backend server**:
   ```bash
   # From the project root directory
   python run_api.py
   ```

2. **Verify your LAN IP address**:
   - Windows: `ipconfig`
   - macOS/Linux: `ipconfig getifaddr en0` or `hostname -I`

3. **Update the hardcoded API URLs** in the files mentioned above if your IP address is different from `192.168.10.112`.

4. **Start the Expo server**:
   ```bash
   # From the frontend directory
   npx expo start
   ```

5. **Scan the QR code with Expo Go** on your device.

6. **Test connectivity** by going to the "Connectivity" tab in the app.

7. **Test messaging** via the "Ping MindBuddy" button on the Home screen.

## Troubleshooting

If you encounter connection issues:

1. Ensure your device and computer are on the same WiFi network.
2. Check that your firewall allows connections to port 8000.
3. Try using a tunnel:
   ```bash
   npx expo start --tunnel
   ```

4. Alternatively, use ngrok to expose your local server:
   ```bash
   # Install ngrok globally
   npm i -g ngrok
   
   # Expose your local backend
   ngrok http 8000
   ```
   
   Then update all API_URL constants in the codebase with the ngrok URL. 
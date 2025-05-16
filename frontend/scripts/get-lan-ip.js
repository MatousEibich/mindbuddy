const os = require('os');
const fs = require('fs');
const path = require('path');

// Get the IPv4 LAN IP address
function getLanIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (loopback) interfaces
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Found LAN IP address: ${iface.address} on interface ${name}`);
        return iface.address;
      }
    }
  }
  console.log("No LAN IP address found. Make sure your device is connected to a network.");
  return null;
}

// Get the IP address
const ip = getLanIpAddress();
if (!ip) {
  process.exit(1);
}

console.log("\n===== REQUIRED MANUAL UPDATES =====");
console.log("You need to update the following files with your IP address:");

const files = [
  "../src/utils/api.js",
  "../src/utils/api.ts",
  "../app/screens/HomeScreen.js",
  "../app/screens/ConnectivityScreen.js"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`\n${file}:`);
      console.log(`Update the line containing 'const apiUrl = "http://192.168.10.112:8000"'`);
      console.log(`Replace with: const apiUrl = "http://${ip}:8000"`);
    }
  } catch (err) {
    // Skip if file doesn't exist
  }
});

console.log("\nAfter updating these files, restart the Expo server."); 
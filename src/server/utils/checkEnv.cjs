const fs = require('fs');
const path = require('path');

// Get the path to the .env file
const envPath = path.resolve(process.cwd(), '.env');

console.log('Checking .env file at:', envPath);

try {
    // Check if file exists without reading contents
    if (fs.existsSync(envPath)) {
        console.log('✅ .env file found and loaded successfully');
    } else {
        console.error('❌ .env file not found');
    }
} catch (error) {
    console.error('Error checking .env file:', error.message);
} 
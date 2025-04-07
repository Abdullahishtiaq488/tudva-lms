/**
 * Backend Startup Script
 * This script helps start the backend server with proper error handling
 * Run with: node start.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Print a fancy header
console.log(`
${colors.cyan}${colors.bright}======================================${colors.reset}
${colors.cyan}${colors.bright}       BACKEND STARTUP SCRIPT         ${colors.reset}
${colors.cyan}${colors.bright}======================================${colors.reset}
`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}❌ .env file not found!${colors.reset}`);
  console.log(`${colors.yellow}Creating a sample .env file...${colors.reset}`);

  // Create a sample .env file
  const sampleEnv = `# Database Configuration
DATABASE_URI=postgresql://postgres.ngpdfyhvlztueekbksju:5ZLXXME3V0EqkYpI@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Supabase Configuration
SUPABASE_URL=https://zghwhhjtxylurrxlsceq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHdoaGp0eHlsdXJyeGxzY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI5NDA3NTAsImV4cCI6MjAyODUxNjc1MH0.LPObkaKJOOTHtuExkU0aclfNtKA3UCQIC6hMGdw-ZME

# Supabase Storage Configuration
SUPABASE_STORAGE_URL=https://ngpdfyhvlztueekbksju.supabase.co/storage/v1/s3
SUPABASE_STORAGE_REGION=ap-south-1
SUPABASE_STORAGE_BUCKET=tudva-bucker
SUPABASE_STORAGE_ACCESS_KEY=c066c4f983fd2ef157b8b15a27be3270
SUPABASE_STORAGE_SECRET_KEY=021c1726ee9e9e0da8cb085dbaec40fcb6a97be0250a4235348b5d0cc6277524

# Server Configuration
PORT=3001
JWT_SECRET=35e5927677801108cf0fa6d01808060a9ab81f0478b5df3384774edda0c608db

# Email Configuration
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=25
EMAIL_USER=08d6b8bc5be42d
EMAIL_PASSWORD=568c586d0ed727
EMAIL_FROM=Tudva <tudva@151.hu>
EMAIL_SECURE=true

# Base URL
BASE_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, sampleEnv);
  console.log(`${colors.green}✅ Sample .env file created!${colors.reset}`);
}

// Verify dependencies
console.log(`${colors.blue}Verifying dependencies...${colors.reset}`);
try {
  execSync('node verify-dependencies.js', { stdio: 'inherit' });
} catch (error) {
  console.error(`${colors.red}❌ Failed to verify dependencies!${colors.reset}`);
  process.exit(1);
}

// Check if combined-server.js exists
const combinedServerPath = path.join(__dirname, 'combined-server.js');
if (!fs.existsSync(combinedServerPath)) {
  console.error(`${colors.red}❌ combined-server.js not found!${colors.reset}`);
  console.log(`${colors.yellow}Falling back to standard server...${colors.reset}`);
}

// Start the server
console.log(`${colors.green}Starting the backend server...${colors.reset}`);
console.log(`${colors.dim}Press Ctrl+C to stop the server${colors.reset}`);

// Use combined-server.js if it exists, otherwise fall back to npm run dev
const serverProcess = fs.existsSync(combinedServerPath) ?
  spawn('node', ['combined-server.js'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  }) :
  spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

// Handle server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();

  // Add colors to the output based on content
  if (output.includes('Error') || output.includes('error')) {
    process.stdout.write(`${colors.red}${output}${colors.reset}`);
  } else if (output.includes('Warning') || output.includes('warning')) {
    process.stdout.write(`${colors.yellow}${output}${colors.reset}`);
  } else if (output.includes('listening') || output.includes('started') || output.includes('success')) {
    process.stdout.write(`${colors.green}${output}${colors.reset}`);
  } else {
    process.stdout.write(output);
  }
});

// Handle server errors
serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`${colors.red}${data.toString()}${colors.reset}`);
});

// Handle server exit
serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`${colors.red}❌ Server process exited with code ${code}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Server process exited successfully${colors.reset}`);
  }
});

// Handle user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
  console.log(`${colors.yellow}Stopping the server...${colors.reset}`);
  serverProcess.kill();
  rl.close();
});

// Display helpful information
setTimeout(() => {
  console.log(`
${colors.cyan}${colors.bright}======================================${colors.reset}
${colors.cyan}${colors.bright}       SERVER INFORMATION             ${colors.reset}
${colors.cyan}${colors.bright}======================================${colors.reset}

${colors.green}Health Check:${colors.reset} http://localhost:3001/
${colors.green}API Health:${colors.reset} http://localhost:3001/api/health
${colors.green}User Profile:${colors.reset} http://localhost:3001/api/user/profile (requires auth token)
${colors.green}Login:${colors.reset} http://localhost:3001/api/user/login (POST)
${colors.green}Register:${colors.reset} http://localhost:3001/api/user/register (POST)

${colors.yellow}For troubleshooting, see Backend_Troubleshooting_Guide.md${colors.reset}
`);
}, 3000);

/**
 * This script verifies that all required dependencies are installed
 * Run with: node verify-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Verifying dependencies...');

// Required dependencies
const requiredDependencies = [
  '@supabase/supabase-js',
  '@aws-sdk/client-s3',
  'express',
  'typeorm',
  'pg',
  'dotenv',
  'cors',
  'helmet',
  'jsonwebtoken',
  'bcryptjs',
  'socket.io'
];

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Read package.json
const packageJson = require(packageJsonPath);
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Check for missing dependencies
const missingDependencies = [];
for (const dep of requiredDependencies) {
  if (!dependencies[dep]) {
    missingDependencies.push(dep);
  }
}

if (missingDependencies.length > 0) {
  console.error(`❌ Missing dependencies: ${missingDependencies.join(', ')}`);
  console.log('Installing missing dependencies...');
  
  try {
    execSync(`npm install ${missingDependencies.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ All required dependencies are installed!');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules directory not found!');
  console.log('Running npm install...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ node_modules directory exists!');
}

// Check TypeScript compilation
console.log('Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.error('❌ TypeScript compilation failed!');
  console.error('Please fix the TypeScript errors before running the server.');
  process.exit(1);
}

console.log('✅ All checks passed! You can now run the server with: npm run dev');

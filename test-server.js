const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URI || 'postgresql://postgres.ngpdfyhvlztueekbksju:5ZLXXME3V0EqkYpI@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

// Create a new client
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

// Database test route
app.get('/db-test', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW() as current_time');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      current_time: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Start the server
async function startServer() {
  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to the database successfully!');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Test server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();

const { Client } = require('pg');
require('dotenv').config();

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URI || 'postgresql://postgres.ngpdfyhvlztueekbksju:5ZLXXME3V0EqkYpI@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

console.log('Testing database connection...');
console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

// Create a new client
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to the database
client.connect()
  .then(() => {
    console.log('✅ Connected to the database successfully!');
    
    // Run a simple query
    return client.query('SELECT NOW() as current_time');
  })
  .then(result => {
    console.log(`Current database time: ${result.rows[0].current_time}`);
    
    // Close the connection
    return client.end();
  })
  .then(() => {
    console.log('Connection closed.');
  })
  .catch(err => {
    console.error('❌ Error connecting to the database:', err);
  });

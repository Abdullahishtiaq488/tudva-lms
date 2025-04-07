import app from './app';
import { createServer } from 'http'; // Import createServer
import { initSocketIO } from './socket'; // Import initSocketIO
import { supabase } from './utils/supabaseClient';
import { AppDataSource } from './config/database';
// import { initEmailQueue } from './utils/queue';
// import { startScheduledTasks } from './utils/scheduler';

const PORT = process.env.PORT || 3001;

// Create an HTTP server from the Express app
const server = createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Function to start the server
const startServer = () => {
    // Initialize database connection
    AppDataSource.initialize()
        .then(() => {
            console.log('✅ Database connection initialized');

            // Start the server after database is initialized
            server.listen(PORT, () => {
                console.log(`✅ Server is running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error('❌ Error initializing database connection:', error);
            process.exit(1);
        });
};

// Start the server
startServer();

// Test Supabase connection
console.log('Testing Supabase connection...');
supabase.auth.getSession()
    .then(({ data, error }) => {
        if (error) {
            console.error('❌ Error connecting to Supabase:', error.message);
        } else {
            console.log('✅ Successfully connected to Supabase');
        }
    })
    .catch((err) => {
        console.error('❌ Error testing Supabase connection:', err);
    });
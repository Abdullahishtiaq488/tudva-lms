import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { supabase } from './utils/supabaseClient';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware'; // Import
import helmet from 'helmet'; // Import helmet
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger';
import { generalLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app: Application = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet()); // Add Helmet middleware *early* in the middleware chain

// Configure CORS *before* your routes
// In development, we'll allow all origins
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true, // Important if your frontend sends cookies/authorization headers
}));

// For production, you should restrict origins:
/*
const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
*/

// HTTP request logging (using Morgan and Winston)
app.use(morgan('combined', { stream: { write: (message) => logger.http(message) } }));

app.use('/api', routes);
app.use(generalLimiter); //Apply general limiter to all endpoints.


// Health check endpoint
app.get('/', async (req: Request, res: Response) => {
    // Check Supabase connection
    let supabaseStatus: { connected: boolean, error: string | null } = { connected: false, error: null };
    try {
        const { data, error } = await supabase.auth.getSession();
        supabaseStatus.connected = !error;
        if (error) supabaseStatus.error = error.message || 'Unknown error';
    } catch (supabaseError: any) {
        supabaseStatus.error = supabaseError.message || 'Unknown error';
    }

    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        supabase: supabaseStatus,
        env: {
            node_env: process.env.NODE_ENV || 'development',
            supabase_url_exists: !!process.env.SUPABASE_URL,
            port: process.env.PORT || '3001'
        }
    };
    res.status(200).json(healthcheck);
});

// Use the error handler *after* all routes
app.use(errorHandler);

export default app;
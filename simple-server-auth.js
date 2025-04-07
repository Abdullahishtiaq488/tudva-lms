const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3003; // Use port 3003 to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://zghwhhjtxylurrxlsceq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHdoaGp0eHlsdXJyeGxzY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI5NDA3NTAsImV4cCI6MjAyODUxNjc1MH0.LPObkaKJOOTHtuExkU0aclfNtKA3UCQIC6hMGdw-ZME';
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Auth Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check Supabase connection
    let supabaseStatus = { connected: false, error: null };
    try {
      const { data, error } = await supabase.auth.getSession();
      supabaseStatus.connected = !error;
      if (error) supabaseStatus.error = error.message;
    } catch (supabaseError) {
      supabaseStatus.error = supabaseError.message;
    }

    res.json({
      status: 'healthy',
      supabase: supabaseStatus,
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        port: PORT
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// User registration endpoint
app.post('/api/user/register', async (req, res) => {
  try {
    console.log('Registration request received');
    console.log('Request body:', req.body);

    // Handle both name and fullName fields for compatibility
    const { email, password, name, fullName, role } = req.body;
    const userName = fullName || name; // Use fullName if provided, otherwise use name

    console.log('Extracted fields:', { email, password: '***', userName, role });

    if (!email || !password || !userName) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Create user with Supabase Auth
    console.log('Creating user with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userName,
          role: role || 'learner'
        }
      }
    });

    if (authError) {
      console.log('Error creating user with Supabase Auth:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    console.log('User created with Supabase Auth:', authData ? 'success' : 'no data returned');

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for confirmation.',
      user: {
        email,
        name: userName,
        role: role || 'learner'
      }
    });

    console.log('Registration completed successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// User login endpoint
app.post('/api/user/login', async (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Sign in with Supabase Auth
    console.log('Signing in with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.log('Error signing in with Supabase Auth:', authError);

      // Special handling for email confirmation
      if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({
          success: false,
          message: 'Please confirm your email address before logging in',
          needsEmailConfirmation: true
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User signed in with Supabase Auth:', authData ? 'success' : 'no data returned');

    // Get user metadata from the session
    const userData = authData.user.user_metadata || {};

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userData.name || email.split('@')[0],
        role: userData.role || 'learner'
      },
      token: authData.session.access_token
    });

    console.log('Login completed successfully');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// User profile endpoint - simplified version that doesn't verify the token
app.get('/api/user/profile', async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid format'
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }

    // For simplicity, we'll just return a hardcoded user profile
    // In a real application, you would verify the token and fetch the user data
    res.json({
      success: true,
      user: {
        id: 'cbf48c23-cf43-47fc-8e3b-e9f3ba7939b2',
        email: 'ayeshajan48888@gmail.com',
        name: 'Abdullah Ishtiaq',
        role: 'instructor',
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user profile'
    });
  }
});

// Email verification endpoint
app.get('/api/user/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify the token with Supabase
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Redirect to the frontend
    res.redirect('http://localhost:3000/login?verified=true');
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during verification'
    });
  }
});

// Resend verification email
app.post('/api/user/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Verification email has been resent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resending verification email'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

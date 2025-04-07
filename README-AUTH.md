# Simplified Authentication Server

This is a simplified authentication server that uses Supabase for authentication. It provides basic endpoints for user registration, login, and profile management.

## Features

- User registration with email and password
- User login with email and password
- User profile retrieval
- Email verification
- CORS support for cross-origin requests

## Endpoints

### Authentication

- `POST /api/user/register` - Register a new user
  - Request body: `{ email, password, fullName, role }`
  - Response: `{ success, message, user }`

- `POST /api/user/login` - Login a user
  - Request body: `{ email, password }`
  - Response: `{ success, message, user, token }`

- `GET /api/user/profile` - Get user profile (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`

- `GET /api/user/verify` - Verify email address
  - Query parameters: `token`
  - Response: Redirects to login page

- `POST /api/user/resend-verification` - Resend verification email
  - Request body: `{ email }`
  - Response: `{ success, message }`

### Health Check

- `GET /api/health` - Check the health of the server
  - Response: `{ status, supabase, environment }`

## How to Run

1. Make sure you have Node.js installed
2. Navigate to the backend directory
3. Run the server:
   ```
   node simple-server-auth.js
   ```
4. The server will start on port 3001

## Authentication Flow

1. **Registration**:
   - User submits registration form with email, password, name, and role
   - Server creates a new user in Supabase Auth
   - Supabase sends a verification email to the user
   - User receives a success message

2. **Email Verification**:
   - User clicks the verification link in the email
   - Supabase verifies the email address
   - User is redirected to the login page

3. **Login**:
   - User submits login form with email and password
   - Server authenticates the user with Supabase Auth
   - Server returns a JWT token and user data
   - Frontend stores the token for future requests

4. **Profile Retrieval**:
   - Frontend includes the JWT token in the Authorization header
   - Server verifies the token and returns the user profile

## Environment Variables

The server uses the following environment variables:

- `PORT` - The port to run the server on (default: 3001)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## Notes

- This is a simplified version of the authentication server for development purposes
- In a production environment, you should implement more robust error handling and security measures
- The profile endpoint currently returns hardcoded user data for simplicity

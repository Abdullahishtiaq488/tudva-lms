# Backend Server

This is the backend server for the Busnet LMS application, using Express.js and Supabase.

## Quick Start

The easiest way to start the backend server is to use our helper script:

```bash
node start.js
```

This script will:
1. Verify all dependencies are installed
2. Check for a valid .env file
3. Start the server using combined-server.js (preferred) or fall back to the standard server
4. Display helpful information about available endpoints

## Manual Setup

If you prefer to set up manually:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Verify dependencies:
   ```bash
   npm run verify
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the TypeScript code
- `npm run start` - Start the production server
- `npm run verify` - Verify all dependencies are installed
- `npm run start:helper` - Start the server with the helper script
- `npm run debug` - Start the server in debug mode
- `npm run typeorm` - Run TypeORM CLI commands

## Testing the Server

Once the server is running, you can test it using these endpoints:

- `http://localhost:3001/` - Basic health check endpoint
- `http://localhost:3001/api/health` - Detailed health check
- `http://localhost:3001/api/user/profile` - User profile (requires auth token)
- `http://localhost:3001/api/user/login` - Login endpoint (POST)
- `http://localhost:3001/api/user/register` - Registration endpoint (POST)
- `http://localhost:3001/api/courses` - Get all courses

## Environment Variables

The server requires several environment variables to be set in a `.env` file:

```
# Database Configuration
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
```

## Troubleshooting

If you encounter any issues, please refer to the `Backend_Troubleshooting_Guide.md` file for detailed troubleshooting steps.

## API Documentation

The server provides the following API endpoints:

### Authentication
- `POST /api/user/register` - Register a new user
- `POST /api/user/login` - Login a user
- `GET /api/user/confirm` - Confirm email address
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Team Collaboration
- `GET /api/team-boards` - Get all boards
- `POST /api/team-boards` - Create a new board
- `GET /api/team-lists` - Get lists for a board
- `POST /api/team-cards` - Create a new card
- `PUT /api/team-cards/:id` - Update a card

## File Storage

The server uses Supabase Storage for file management. You can use the provided utility functions in `src/utils/supabaseStorage.ts` to:

- Upload files
- Download files
- Delete files
- Generate signed URLs
- List files in a directory

## Socket.IO

The server includes Socket.IO for real-time communication. Socket events are defined in `src/socket.ts`.
#   t u d v a - l m s  
 #   t u d v a - l m s  
 
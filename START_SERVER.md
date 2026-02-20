# Start the Hontis HSAC Server

## Quick Start

The React frontend needs an API backend to authenticate users. Since .NET is not installed, we've created a **Node.js backend** that works with your Supabase database.

## Step 1: Get Your Supabase Database Password

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **reupqcswsszsrgnqmeey**
3. Go to **Settings** → **Database**
4. Under **Connection Info**, find your **Database password**
5. Copy the password

## Step 2: Start the Backend API Server

Open a new terminal and run:

```bash
# Set the database password (replace YOUR_PASSWORD with your actual password)
export SUPABASE_DB_PASSWORD="YOUR_PASSWORD"

# Start the Node.js API server
node server.cjs
```

You should see:
```
========================================
Hontis HSAC API Server running on http://localhost:5000
========================================
```

## Step 3: Start the Frontend

In another terminal, run:

```bash
npm run dev
```

## Step 4: Login

1. Open http://localhost:5173 in your browser
2. Login with:
   - **Username**: admin
   - **Password**: Admin@123

## Troubleshooting

### Login fails with "Invalid username or password"
- Make sure the backend server is running (check http://localhost:5000)
- Verify you used the correct Supabase database password
- Check the backend terminal for error messages

### Can't connect to backend
- Ensure the backend is running on port 5000
- Check that nothing else is using port 5000: `lsof -i :5000`

### Database connection errors
- Verify your Supabase password is correct
- Check your internet connection
- Make sure the Supabase project is active

## Alternative: Use .NET Backend (if you have .NET installed)

If you have .NET SDK installed, you can use the official backend:

```bash
cd backend/HontisHSAC.API

# Update the password in appsettings.json first
# Then run:
dotnet run
```

The .NET backend has full functionality including user creation, role management, and all CRUD operations.

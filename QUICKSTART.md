# Quick Start Guide - Launch in 2 Steps!

## Step 1: Start the Backend

Open a terminal and run:

```bash
npm run server
```

You should see:
```
✓ Hontis HSAC API Server running
✓ Server: http://localhost:5000
```

**Keep this terminal open!**

## Step 2: Start the Frontend

Open a **NEW terminal** and run:

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Step 3: Login

Use these credentials:
- **Username**: `admin`
- **Password**: `Admin@123`

## That's it!

You should now be logged in and see the dashboard with access to:
- Dashboard
- Users Management
- Roles Management
- Permissions Management
- Role-Permission Matrix

---

## Troubleshooting

**"Invalid username or password"**
- Make sure the backend server is running (check Terminal #1)
- Verify you're using `admin` and `Admin@123` exactly

**Can't access the app**
- Ensure both terminals are running
- Open http://localhost:5173 (not localhost:5000)

**Port already in use**
- Kill any existing servers: `pkill -f "node server"`
- Then restart with `npm run server`

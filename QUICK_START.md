# Quick Start Guide - Hontis HSAC

Get up and running in 10 minutes!

---

## Prerequisites Checklist

- [ ] Visual Studio 2022
- [ ] SQL Server 2019+ (or Azure SQL)
- [ ] .NET 8 SDK
- [ ] Node.js 18+

---

## Step 1: Database Setup (2 minutes)

### Option A: Local SQL Server
1. Open SQL Server Management Studio
2. Connect to `localhost`
3. Execute:
```sql
CREATE DATABASE HontisHSAC;
```

### Option B: Azure SQL
1. Create database in Azure Portal
2. Note server name, username, password
3. Add your IP to firewall rules

---

## Step 2: Backend Setup (3 minutes)

1. **Open in Visual Studio**
   ```
   Open: backend/HontisHSAC.API/HontisHSAC.API.csproj
   ```

2. **Update Connection String**

   Edit `backend/HontisHSAC.API/appsettings.Development.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=HontisHSAC;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```

3. **Apply Database Migrations**

   In Package Manager Console:
   ```powershell
   Update-Database
   ```

4. **Run Backend**

   Press `F5` or click Start button

   Backend runs at: `http://localhost:5000`

   Swagger UI: `http://localhost:5000/swagger`

---

## Step 3: Frontend Setup (3 minutes)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Verify Environment**

   Check `.env` file:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Run Frontend**
   ```bash
   npm run dev
   ```

   Frontend runs at: `http://localhost:5173`

---

## Step 4: Test Everything (2 minutes)

1. **Open browser**: `http://localhost:5173`

2. **Login**:
   - Username: `admin`
   - Password: `Admin@123`

3. **Verify**:
   - [ ] Dashboard loads
   - [ ] Navigate to Users page
   - [ ] Navigate to Roles page
   - [ ] Navigate to Permissions page

---

## Troubleshooting Quick Fixes

### Backend won't start
```powershell
# Rebuild solution
Clean-Solution
Build-Solution
```

### Database connection fails
- Verify SQL Server is running
- Check connection string
- For Azure: Check firewall rules

### Frontend can't connect
- Ensure backend is running
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in backend

### Migration fails
```powershell
# Reset migrations
Remove-Migration
Add-Migration InitialCreate
Update-Database
```

---

## Port Configuration

| Service | Default Port |
|---------|--------------|
| Backend API | 5000 (HTTP), 5001 (HTTPS) |
| Frontend | 5173 |
| SQL Server | 1433 |

---

## Next Steps

- Read `PROJECT_OVERVIEW.md` for architecture details
- Read `backend/SETUP_GUIDE.md` for comprehensive guide
- Check Swagger UI for API documentation
- Explore the codebase

---

## Common Commands

### Backend (Package Manager Console)
```powershell
Add-Migration MigrationName    # Create migration
Update-Database                # Apply migrations
Remove-Migration               # Remove last migration
```

### Frontend (Terminal)
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run linter
```

---

## Default Credentials

**Admin User:**
- Username: `admin`
- Password: `Admin@123`

**Change this password immediately after first login!**

---

## Project Structure Quick Reference

```
project/
├── backend/
│   ├── HontisHSAC.API/           # Web API
│   ├── HontisHSAC.Application/   # Business Logic
│   ├── HontisHSAC.Core/          # Domain Models
│   └── HontisHSAC.Infrastructure/ # Database & Services
│
└── src/                          # React Frontend
    ├── components/
    ├── pages/
    ├── contexts/
    └── lib/
```

---

## API Testing with Swagger

1. Open: `http://localhost:5000/swagger`
2. Expand `/api/Auth/login`
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "username": "admin",
     "password": "Admin@123"
   }
   ```
5. Copy the token from response
6. Click "Authorize" button (top right)
7. Enter: `Bearer YOUR_TOKEN`
8. Now you can test all endpoints!

---

## Need More Help?

- **Detailed Setup**: See `backend/SETUP_GUIDE.md`
- **Architecture**: See `PROJECT_OVERVIEW.md`
- **Database**: See `backend/DatabaseSetup.sql`

---

**Ready to code? Happy developing!**

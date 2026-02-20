# Hontis HSAC - Hierarchical Security and Access Control System

A production-ready, enterprise-grade security and access control system built with ASP.NET Core Web API and React TypeScript.

## 🚀 Quick Start

**Want to run the app right now?** See **[QUICK_START.md](QUICK_START.md)** for simple instructions!

### TL;DR
1. Open `backend/HontisHSAC.sln` in Visual Studio 2022
2. Update connection string in `appsettings.Development.json`
3. Run `Update-Database` in Package Manager Console
4. Press F5 to start backend
5. Run `npm install && npm run dev` for frontend
6. Login at http://localhost:5173 with admin / Admin@123

---

## Project Structure

```
project/
├── backend/                    # ASP.NET Core API
│   ├── HontisHSAC.API/        # Web API controllers and configuration
│   ├── HontisHSAC.Application/ # Business logic and services
│   ├── HontisHSAC.Core/       # Domain entities and interfaces
│   └── HontisHSAC.Infrastructure/ # Data access and external services
├── src/                        # React frontend
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React contexts (Auth)
│   ├── lib/                   # API client and utilities
│   ├── pages/                 # Page components
│   └── types/                 # TypeScript type definitions
└── README.md                  # This file
```

## Technology Stack

### Backend
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM for database operations
- **Azure SQL Server / SQL Server 2019+** - Enterprise database
- **JWT Authentication** - Secure token-based auth
- **BCrypt.Net** - Password hashing
- **Clean Architecture** - Maintainable, scalable structure

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Features

- JWT-based authentication
- Permission-based authorization
- User management (CRUD)
- Role management (CRUD)
- Permission management
- Role-Permission matrix for bulk assignments
- Audit logging for security events
- Responsive design

## Default Admin Credentials

```
Username: admin
Email: admin@hontis.com
Password: Admin@123
```

**IMPORTANT: Change the admin password after first login!**

## Default Roles

1. **Administrator** - Full system access (all permissions)
2. **User Manager** - Manage users and their roles
3. **Role Manager** - Manage roles and permissions
4. **Read Only** - View-only access

## Permissions

The system includes 14 permissions across 3 modules:

- **User Management**: USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, USER_ACTIVATE, USER_RESET_PASSWORD, USER_ASSIGN_ROLES
- **Role Management**: ROLE_CREATE, ROLE_READ, ROLE_UPDATE, ROLE_DELETE, ROLE_ASSIGN_PERMISSIONS
- **Permission Management**: PERMISSION_READ, PERMISSION_ASSIGN

## Getting Started

### Prerequisites

- **Visual Studio 2022** (Community, Professional, or Enterprise)
- **.NET 8.0 SDK**
- **SQL Server 2019+** or **Azure SQL Database**
- **Node.js 18+** (for frontend)

### Backend Setup

1. **Create Database**

   In SQL Server Management Studio:
   ```sql
   CREATE DATABASE HontisHSAC;
   ```

2. **Configure Database Connection**

   Update `backend/HontisHSAC.API/appsettings.Development.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=HontisHSAC;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```

   For Azure SQL, update `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=yourserver.database.windows.net;Database=HontisHSAC;User Id=yourusername;Password=yourpassword;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
   }
   ```

3. **Open in Visual Studio**

   Open `backend/HontisHSAC.sln` in Visual Studio 2022

4. **Apply Database Migrations**

   In Package Manager Console:
   ```powershell
   Update-Database
   ```

5. **Run the Backend**

   Press F5 or click the green Start button

   The API will be available at `http://localhost:5000` or `https://localhost:5001`.

   Swagger documentation: `http://localhost:5000/swagger`

### Frontend Setup

1. **Configure API URL**

   The `.env` file is already configured:

   ```
   VITE_API_URL=http://localhost:5000
   ```

   Update if your backend runs on a different port.

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Frontend**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

## Documentation

For detailed setup and architecture information:

- **[QUICK_START.md](QUICK_START.md)** - Get started in 10 minutes
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete architecture guide
- **[backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[backend/DatabaseSetup.sql](backend/DatabaseSetup.sql)** - Manual database setup script

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users (Requires USER_ADMIN permission)
- `GET /api/users` - Get all users (with search)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/activate` - Toggle user active status
- `POST /api/users/{id}/reset-password` - Reset user password
- `POST /api/users/{id}/roles` - Assign roles to user

### Roles (Requires ROLE_ADMIN permission)
- `GET /api/roles` - Get all roles
- `GET /api/roles/{id}` - Get role by ID
- `POST /api/roles` - Create new role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role
- `POST /api/roles/{id}/permissions` - Assign permissions to role

### Permissions (Requires authentication)
- `GET /api/permissions` - Get all permissions

## Development

### Backend Development

```bash
cd backend/HontisHSAC.API
dotnet watch run
```

### Frontend Development

```bash
npm run dev
```

### Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd backend/HontisHSAC.API
dotnet publish -c Release -o ./publish
```

## Database Schema

The application uses the following main tables:

- **AppUsers** - User accounts
- **AppRoles** - System roles
- **AppPermissions** - Available permissions
- **AppUserRoles** - User-Role assignments
- **AppRolePermissions** - Role-Permission assignments
- **SecurityAuditLogs** - Audit trail for security events

## Security Considerations

- All passwords are hashed using BCrypt with work factor 12
- JWT tokens expire after 8 hours
- Permission checks are enforced on both frontend and backend
- Audit logs track all security-related events
- CORS is configured to only allow specific origins

## Troubleshooting

### Backend won't start
- Check that the database connection string is correct
- Verify SQL Server is running and accessible
- Check that port 5000/5001 is not already in use
- Rebuild solution in Visual Studio

### Frontend can't connect to backend
- Verify the backend is running
- Check the VITE_API_URL in `.env`
- Ensure CORS is properly configured in backend

### Login fails
- Verify database has been seeded (check console output)
- Use the default admin credentials
- Check browser console for errors

## License

Proprietary - Hontis HSAC Internal Use Only

## Support

For support, contact your system administrator.

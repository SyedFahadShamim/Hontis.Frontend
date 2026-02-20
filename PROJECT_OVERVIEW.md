# Hontis HSAC - Project Overview

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **Language**: C# 12
- **Architecture**: Clean Architecture (4-layer)
- **ORM**: Entity Framework Core 8.0
- **Database**: Azure SQL Server / SQL Server 2019+
- **Authentication**: JWT Bearer Tokens
- **Password Hashing**: BCrypt
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Routing**: React Router v7
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)

### Development Tools
- **Backend IDE**: Visual Studio 2022
- **Frontend IDE**: VS Code (recommended)
- **Database Tools**: SQL Server Management Studio (SSMS)
- **Version Control**: Git

---

## Project Structure

```
project-root/
│
├── backend/                          # ASP.NET Core Backend
│   ├── HontisHSAC.API/              # Web API Layer
│   │   ├── Controllers/              # REST API Controllers
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── RolesController.cs
│   │   │   └── PermissionsController.cs
│   │   ├── Authorization/            # Custom Authorization
│   │   │   └── RequirePermissionAttribute.cs
│   │   ├── Properties/
│   │   │   └── launchSettings.json  # Launch configuration
│   │   ├── appsettings.json         # Production configuration
│   │   ├── appsettings.Development.json  # Development configuration
│   │   ├── Program.cs               # Application entry point
│   │   └── HontisHSAC.API.csproj    # Project file
│   │
│   ├── HontisHSAC.Application/      # Application Layer
│   │   ├── DTOs/                    # Data Transfer Objects
│   │   │   ├── AuthDtos.cs
│   │   │   ├── UserDtos.cs
│   │   │   └── RoleDtos.cs
│   │   ├── Interfaces/              # Service Interfaces
│   │   │   ├── IAuthenticationService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IRoleService.cs
│   │   │   └── IJwtTokenService.cs
│   │   ├── Services/                # Business Logic
│   │   │   ├── AuthenticationService.cs
│   │   │   ├── UserService.cs
│   │   │   └── RoleService.cs
│   │   └── HontisHSAC.Application.csproj
│   │
│   ├── HontisHSAC.Core/             # Domain Layer
│   │   ├── Entities/                # Domain Models
│   │   │   ├── AppUser.cs
│   │   │   ├── AppRole.cs
│   │   │   ├── AppPermission.cs
│   │   │   ├── AppUserRole.cs
│   │   │   ├── AppRolePermission.cs
│   │   │   └── SecurityAuditLog.cs
│   │   ├── Interfaces/              # Core Interfaces
│   │   │   └── IPasswordHasher.cs
│   │   └── HontisHSAC.Core.csproj
│   │
│   ├── HontisHSAC.Infrastructure/   # Infrastructure Layer
│   │   ├── Data/                    # Database Context
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── DatabaseSeeder.cs
│   │   ├── Services/                # Infrastructure Services
│   │   │   ├── JwtTokenService.cs
│   │   │   └── PasswordHasher.cs
│   │   └── HontisHSAC.Infrastructure.csproj
│   │
│   ├── DatabaseSetup.sql            # Manual DB setup script
│   ├── SETUP_GUIDE.md               # Comprehensive setup guide
│   └── README.md                    # Backend documentation
│
├── src/                             # React Frontend
│   ├── components/                  # Reusable Components
│   │   ├── AppLayout.tsx           # Main layout wrapper
│   │   └── ProtectedRoute.tsx      # Route protection
│   ├── contexts/                    # React Contexts
│   │   └── AuthContext.tsx         # Authentication context
│   ├── lib/                         # Utilities
│   │   └── api.ts                  # API client & endpoints
│   ├── pages/                       # Page Components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── RolesPage.tsx
│   │   ├── PermissionsPage.tsx
│   │   ├── RolePermissionMatrixPage.tsx
│   │   └── UnauthorizedPage.tsx
│   ├── types/                       # TypeScript Types
│   │   └── index.ts
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Application entry
│   └── index.css                    # Global styles
│
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json                     # Frontend dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind config
└── PROJECT_OVERVIEW.md              # This file
```

---

## Architecture Explanation

### Clean Architecture Layers

#### 1. **API Layer** (HontisHSAC.API)
- **Purpose**: Entry point for HTTP requests
- **Responsibilities**:
  - Expose REST API endpoints
  - Handle HTTP request/response
  - Route requests to services
  - Validate input
  - Configure middleware (CORS, Authentication)
  - Generate API documentation (Swagger)

#### 2. **Application Layer** (HontisHSAC.Application)
- **Purpose**: Business logic and use cases
- **Responsibilities**:
  - Define DTOs for data transfer
  - Implement business rules
  - Orchestrate domain operations
  - Define service interfaces
  - Handle application workflows

#### 3. **Core/Domain Layer** (HontisHSAC.Core)
- **Purpose**: Core business entities and rules
- **Responsibilities**:
  - Define domain entities (User, Role, Permission)
  - Contain core business logic
  - Define domain interfaces
  - No dependencies on other layers

#### 4. **Infrastructure Layer** (HontisHSAC.Infrastructure)
- **Purpose**: External concerns and persistence
- **Responsibilities**:
  - Database context (Entity Framework)
  - Database migrations
  - External service implementations
  - Password hashing
  - JWT token generation
  - Data seeding

### Dependency Flow
```
API → Application → Infrastructure
         ↓
       Core (No dependencies)
```

---

## Key Features

### 1. Authentication & Authorization
- **JWT-based authentication**
- Token expiration and refresh
- Secure password hashing (BCrypt)
- Role-based access control (RBAC)
- Permission-based authorization
- Audit logging for security events

### 2. User Management
- Create, read, update users
- Activate/deactivate user accounts
- Reset user passwords
- Assign multiple roles to users
- View user permissions
- Search and filter users

### 3. Role Management
- Create, read, update, delete roles
- Assign permissions to roles
- View role hierarchy
- Role activation/deactivation
- Permission matrix view

### 4. Permission Management
- Granular permission control
- Module-based permission grouping
- Permission assignment to roles
- Permission inheritance through roles

### 5. Security Features
- Audit logging for all critical operations
- Password complexity enforcement
- JWT token validation
- CORS protection
- SQL injection prevention (Entity Framework)
- XSS prevention (React)

---

## Database Schema

### Tables

#### AppUsers
- UserId (PK)
- Username (unique)
- Email (unique)
- FullName
- PasswordHash
- IsActive
- LastLoginOn
- CreatedOn, CreatedBy
- UpdatedOn, UpdatedBy

#### AppRoles
- RoleId (PK)
- RoleCode (unique)
- RoleName
- Description
- IsActive
- CreatedOn, CreatedBy
- UpdatedOn, UpdatedBy

#### AppPermissions
- PermissionId (PK)
- PermissionCode (unique)
- PermissionName
- ModuleName
- Description

#### AppUserRoles (Junction)
- UserRoleId (PK)
- UserId (FK)
- RoleId (FK)
- AssignedOn, AssignedBy

#### AppRolePermissions (Junction)
- RolePermissionId (PK)
- RoleId (FK)
- PermissionId (FK)
- GrantedOn, GrantedBy

#### SecurityAuditLogs
- AuditId (PK)
- EventType
- EventData (JSON)
- ActorUserId (FK)
- TargetUserId (FK)
- Timestamp

### Relationships
- User → UserRoles ← Role (Many-to-Many)
- Role → RolePermissions ← Permission (Many-to-Many)
- User → AuditLogs (One-to-Many, as actor and target)

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/Auth/login | User login |
| GET | /api/Auth/me | Get current user profile |
| POST | /api/Auth/logout | User logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/Users | Get all users |
| GET | /api/Users/{id} | Get user by ID |
| POST | /api/Users | Create new user |
| PUT | /api/Users/{id} | Update user |
| PATCH | /api/Users/{id}/activate | Toggle user status |
| POST | /api/Users/{id}/reset-password | Reset password |
| POST | /api/Users/{id}/roles | Assign roles |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/Roles | Get all roles |
| GET | /api/Roles/{id} | Get role by ID |
| POST | /api/Roles | Create new role |
| PUT | /api/Roles/{id} | Update role |
| DELETE | /api/Roles/{id} | Delete role |
| POST | /api/Roles/{id}/permissions | Assign permissions |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/Permissions | Get all permissions |

---

## Configuration

### Backend Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=HontisHSAC;..."
  },
  "Jwt": {
    "SecretKey": "YourSecretKey",
    "Issuer": "HontisHSAC",
    "Audience": "HontisHSAC"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

### Frontend Configuration (.env)

```
VITE_API_URL=http://localhost:5000
```

---

## Default Credentials

After database seeding:
- **Username**: admin
- **Password**: Admin@123
- **Roles**: Administrator
- **Permissions**: All

---

## Development Workflow

### Backend Development
1. Make changes to entities/services
2. Create migration: `Add-Migration MigrationName`
3. Update database: `Update-Database`
4. Test in Swagger UI
5. Commit changes

### Frontend Development
1. Update types if API changed
2. Update API client methods
3. Create/update components
4. Test in browser
5. Commit changes

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use HTTPS in production** - Always encrypt traffic
3. **Validate all inputs** - Server-side validation is mandatory
4. **Use parameterized queries** - Entity Framework handles this
5. **Implement rate limiting** - Prevent brute force attacks
6. **Enable CORS properly** - Don't use "*" in production
7. **Keep dependencies updated** - Regular security patches
8. **Use strong JWT secrets** - Minimum 32 characters
9. **Log security events** - Audit trail for compliance
10. **Implement password policies** - Enforce strong passwords

---

## Testing Strategy

### Backend Testing
- Unit tests for services
- Integration tests for repositories
- API tests for controllers
- Database tests for migrations

### Frontend Testing
- Component tests (React Testing Library)
- Integration tests (API interactions)
- E2E tests (Playwright/Cypress)

---

## Deployment Considerations

### Backend
- Deploy to Azure App Service
- Use Azure SQL Database
- Configure Application Insights
- Set up CI/CD with Azure DevOps
- Use Azure Key Vault for secrets

### Frontend
- Deploy to Azure Static Web Apps
- Configure custom domain
- Enable CDN for static assets
- Set up environment-specific builds

---

## Performance Optimization

### Backend
- Use async/await for all I/O operations
- Implement caching (Redis/Memory Cache)
- Use eager loading for related entities
- Index frequently queried columns
- Implement pagination for large datasets

### Frontend
- Code splitting for routes
- Lazy loading for components
- Memoization for expensive calculations
- Image optimization
- Bundle size optimization

---

## Monitoring & Logging

### Backend
- Application Insights for monitoring
- Structured logging (Serilog)
- Health checks endpoint
- Performance metrics

### Frontend
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring
- User behavior tracking

---

## Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] User profile management
- [ ] Advanced audit log filtering
- [ ] Permission templates
- [ ] Role cloning
- [ ] Bulk user import
- [ ] Export to Excel
- [ ] Real-time notifications
- [ ] Dark mode support

### Technical Improvements
- [ ] API versioning
- [ ] GraphQL support
- [ ] WebSocket for real-time updates
- [ ] Background job processing
- [ ] Automated testing
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Multi-tenancy support

---

## Support & Resources

### Documentation
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core Docs](https://docs.microsoft.com/ef/core)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Project Files
- `backend/SETUP_GUIDE.md` - Complete setup instructions
- `backend/DatabaseSetup.sql` - Manual database setup
- `backend/README.md` - Backend documentation

---

**Project Version**: 1.0.0
**Last Updated**: January 2026
**Maintained by**: Hontis Development Team

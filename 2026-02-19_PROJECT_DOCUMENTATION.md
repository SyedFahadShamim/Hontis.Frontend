# Hontis HSAC - Project Documentation
**Date**: 2026-02-19
**Version**: 1.0
**Application**: Hontis HSAC Admin Portal
**Stack**: React 18 + TypeScript (Frontend) | .NET 8 Web API (Backend) | PostgreSQL via Supabase (Database)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Environment Setup](#3-environment-setup)
4. [Frontend Structure](#4-frontend-structure)
   - [Pages](#41-pages)
   - [Components](#42-components)
   - [API Modules](#43-api-modules)
   - [Types](#44-types)
   - [Auth Context](#45-auth-context)
   - [Routing](#46-routing)
5. [Backend Structure](#5-backend-structure)
   - [Controllers](#51-controllers)
   - [Services](#52-services)
   - [Entities](#53-entities)
   - [DTOs](#54-dtos)
   - [Authorization](#55-authorization)
6. [Database Schema](#6-database-schema)
7. [Permissions Reference](#7-permissions-reference)
8. [Developer Guide](#8-developer-guide)
9. [Tester Guide](#9-tester-guide)
   - [Test Accounts](#91-test-accounts)
   - [Test Scenarios](#92-test-scenarios)
10. [Known Patterns & Conventions](#10-known-patterns--conventions)

---

## 1. Project Overview

Hontis HSAC is a comprehensive pharmaceutical administration portal that provides:

- **Role-Based Access Control (RBAC)** — User, Role, and Permission management with a visual matrix
- **Master Data Management** — Product Categories, Manufacturers, Suppliers, Dosage Forms
- **Product Management** — Full product lifecycle with price history tracking
- **Doctor Database** — Healthcare provider records with geographic and speciality data
- **Email Integration** — Built-in email client (Inbox, Sent, Drafts, Trash)
- **Security Audit Logging** — Activity tracking for all user actions

---

## 2. Architecture

```
Frontend (React/Vite)
  └── src/
       ├── pages/          → Route-level components (one per page)
       ├── components/     → Shared/reusable UI components
       ├── lib/            → API service modules (axios-based)
       ├── contexts/       → React Context (Auth)
       └── types/          → TypeScript interfaces and types

Backend (.NET Clean Architecture)
  └── HontisHSAC.API/          → Controllers, Authorization attributes
  └── HontisHSAC.Application/  → DTOs, Interfaces, Service implementations
  └── HontisHSAC.Core/         → Entities, DB Context, Seeder
  └── HontisHSAC.Infrastructure/ → JWT, Email, Password hashing

Database (PostgreSQL / Supabase)
  └── supabase/migrations/      → SQL migration files
```

**Data Flow**:
1. Frontend calls API via `src/lib/` modules (axios + Bearer token)
2. Backend validates JWT, checks permissions via `[RequirePermission]` attribute
3. Controller calls Service layer for business logic
4. Service interacts with `ApplicationDbContext` (Entity Framework Core)
5. Response returns → React Query caches it → UI re-renders

---

## 3. Environment Setup

### Frontend `.env` Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |

### Backend `appsettings.json` / `appsettings.Development.json`

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | PostgreSQL / SQL Server connection string |
| `JwtSettings:SecretKey` | JWT signing secret |
| `JwtSettings:Issuer` | JWT issuer |
| `JwtSettings:Audience` | JWT audience |
| `JwtSettings:ExpiryInMinutes` | Token lifetime |
| `EmailSettings:*` | IMAP/SMTP email credentials |

### Running Locally

```bash
# Frontend
npm install
npm run dev           # http://localhost:5173

# Backend (from /backend)
dotnet run --project HontisHSAC.API

# Type checking
npm run typecheck

# Production build
npm run build
```

---

## 4. Frontend Structure

### 4.1 Pages

All pages live in `src/pages/`. Each page is a route-level component that handles its own data fetching via React Query.

---

#### `LoginPage.tsx`
**Route**: `/login`
**Access**: Public
**Purpose**: Application entry point with authentication form.

**Features**:
- Username/email + password form
- Password visibility toggle
- Displays default credentials hint (`admin` / `Admin@123`)
- Redirects to `/dashboard` on success

**API Calls**:
- `authApi.login({ usernameOrEmail, password })`

---

#### `DashboardPage.tsx`
**Route**: `/dashboard`
**Access**: Authenticated
**Purpose**: Home screen showing user profile and quick navigation cards.

**Features**:
- Displays logged-in user name, email, roles, and permissions count
- Quick action cards: Users, Roles, Permissions, Role-Permission Matrix
- Cards are hidden based on the user's permissions

**Permission Checks**:
- `USER_ADMIN` → Users card visible
- `ROLE_ADMIN` → Roles card + Role-Permission Matrix card visible

---

#### `UsersPage.tsx`
**Route**: `/users`
**Access**: `USER_READ`
**Purpose**: Full CRUD for application user accounts.

**Features**:
- Searchable, paginated user list
- Create user (username, email, fullName, password)
- Edit user (email, fullName only)
- Assign/revoke roles
- Reset password (shows generated temporary password)
- Toggle active/inactive status
- Displays user roles, last login, and status badge

**API Calls**:
- `usersApi.getAll(search?)` — list
- `usersApi.create(data)` — create
- `usersApi.update(id, data)` — edit
- `usersApi.toggleActive(id)` — activate/deactivate
- `usersApi.resetPassword(id)` — reset
- `usersApi.assignRoles(id, { roleIds })` — role assignment
- `rolesApi.getAll()` — populate role dropdown

**Modals**: Create User | Edit User | Assign Roles | Reset Password Result

---

#### `RolesPage.tsx`
**Route**: `/roles`
**Access**: `ROLE_READ`
**Purpose**: Manage application roles.

**Features**:
- Card grid layout of all roles
- Create role (code, name, description)
- Edit role (name and description; code is immutable)
- Delete role (only allowed if no users are assigned)
- Shows user count and active/inactive status per role

**API Calls**:
- `rolesApi.getAll()` — list
- `rolesApi.create(data)` — create
- `rolesApi.update(id, data)` — edit
- `rolesApi.delete(id)` — delete

---

#### `PermissionsPage.tsx`
**Route**: `/permissions`
**Access**: Authenticated (no permission restriction)
**Purpose**: Read-only view of all system permissions grouped by module.

**Features**:
- Permissions grouped into color-coded modules
- Displays permission code, name, description, and module
- Shows count per module

**Modules**:
- User Management, Role Management, Master Data, Geography, Rules, Data Import

**API Calls**:
- `permissionsApi.getAll()`

---

#### `RolePermissionMatrixPage.tsx`
**Route**: `/role-permission-matrix`
**Access**: `ROLE_ASSIGN_PERMISSIONS`
**Purpose**: Interactive matrix to assign permissions to roles.

**Features**:
- Roles as columns, permissions as rows, grouped by module
- Checkbox toggling with unsaved changes counter
- Visual feedback: green = newly granted, red = newly revoked
- Sticky column/row headers for horizontal scroll
- Save / Cancel buttons

**API Calls**:
- `rolesApi.getAll()` — columns
- `permissionsApi.getAll()` — rows
- `rolesApi.getById(id)` — load existing assignments per role
- `rolesApi.assignPermissions(id, { permissionIds })` — save changes

---

#### `ProductCategoriesPage.tsx`
**Route**: `/master/product-categories`
**Access**: `MASTER_PRODUCT_VIEW`
**Purpose**: Manage product categories.

**Features**:
- Paginated list with search, status filter, sortable columns
- Create / Edit category (code, name, description, sort order, status)
- Update status inline
- Delete category

**Fields**: Code, Name, Description, Status (Active/Inactive), Sort Order

**API Calls**:
- `productCategoriesApi.getAll(params)` — paginated list
- `productCategoriesApi.create(data)`
- `productCategoriesApi.update(id, data)`
- `productCategoriesApi.updateStatus(id, status)`
- `productCategoriesApi.delete(id)`

---

#### `ManufacturersPage.tsx`
**Route**: `/master/manufacturers`
**Access**: `MASTER_MANUFACTURER_VIEW`
**Purpose**: Manage product manufacturers.

**Fields**: Code, Name, Country, Status, Sort Order

**API Calls**: Same pattern as `ProductCategoriesPage`, endpoint: `/manufacturers`

---

#### `SuppliersPage.tsx`
**Route**: `/master/suppliers`
**Access**: `MASTER_SUPPLIER_VIEW`
**Purpose**: Manage product suppliers.

**Fields**: Code, Name, City, Country, Status

**API Calls**: Same pattern as `ProductCategoriesPage`, endpoint: `/suppliers`

---

#### `DosageFormsPage.tsx`
**Route**: `/master/dosage-forms`
**Access**: `MASTER_DOSAGEFORM_VIEW`
**Purpose**: Manage pharmaceutical dosage forms (e.g., Tablet, Capsule, Syrup).

**Fields**: Code, Name, Status

**API Calls**: Same pattern as `ProductCategoriesPage`, endpoint: `/dosage-forms`

---

#### `ProductsPage.tsx`
**Route**: `/master/products`
**Access**: `MASTER_PRODUCT_VIEW`
**Purpose**: Comprehensive product lifecycle management.

**Features**:
- Multi-filter list (search, lifecycle status, category, manufacturer)
- Lifecycle status badge: Draft | Active | Inactive | Discontinued
- Create / Edit product with full detail form
- Change prices with effective date (tracked in price history)
- View full price history
- Update lifecycle status
- Delete product (marks as Discontinued)

**Price Fields**: MRP, Trade Price, Distribution Price, Product Price

**API Calls**:
- `productsApi.getAll(params)`
- `productsApi.create(data)` / `update(id, data)`
- `productsApi.updateLifecycle(id, status)`
- `productsApi.delete(id)`
- `productsApi.changePrices(productCode, data)`
- `productsApi.getPriceHistory(productCode)`
- `productsApi.getCurrentPrices(productCode)`
- Lookup calls: `getMolecules()`, `getTaxTypes()`, `getActiveCategories()`, `getActiveManufacturers()`, `getActiveSuppliers()`, `getActiveDosageForms()`

**Modals**: Product Form | Change Prices | Price History | Lifecycle Status Update

---

#### `DoctorsPage.tsx`
**Route**: `/master/doctors`
**Access**: `MASTER_DOCTOR_VIEW`
**Purpose**: Healthcare provider database management.

**Features**:
- Advanced filtering (search text, speciality, doctor status code, city, record status)
- Create / Edit doctor records
- Update record status (Active/Inactive)
- Update doctor status code (Prospect / Active / Inactive / Blocked)
- Geographic data (Region → City → Brick)

**Fields**: Doctor Code, Name, Speciality, Doctor Status, Region, City, Brick, Phone, Email, Onboarding Date, First Contact Person, Notes

**API Calls**:
- `doctorsApi.getAll(params)` / `getById(id)`
- `doctorsApi.create(data)` / `update(id, data)`
- `doctorsApi.updateStatus(id, status)`
- `doctorsApi.updateDoctorStatusCode(id, statusCode)`
- Lookups: `getSpecialities()`, `getDoctorStatuses()`, `getGeoRegions()`, `getGeoCities(regionCode?)`, `getGeoBricks(cityCode?)`

**Modals**: Doctor Form | Doctor Status Update

---

#### `EmailPage.tsx`
**Route**: `/email/drafts` | `/email/:folder` | `/email/:folder/:messageId`
**Access**: `EMAIL_ACCESS`
**Purpose**: Built-in email client.

**Features**: Folder navigation, message list, message detail view, compose, reply, forward, move, delete, mark read/unread, attachment handling

---

#### `UnauthorizedPage.tsx`
**Route**: `/unauthorized`
**Access**: Public
**Purpose**: Shown when a user navigates to a route they don't have permission to access. Provides a link back to dashboard.

---

### 4.2 Components

All components live in `src/components/`.

---

#### `AppLayout.tsx`
**Purpose**: Main application shell — sidebar + header + content area.

**Sidebar Navigation Groups**:
| Group | Items | Permission Required |
|---|---|---|
| Administration | Dashboard | — |
| Administration | Users | `USER_ADMIN` |
| Administration | Roles | `ROLE_READ` |
| Administration | Permissions | — |
| Administration | Role-Permission Matrix | `ROLE_ASSIGN_PERMISSIONS` |
| Lookups | Product Categories | `MASTER_PRODUCT_VIEW` |
| Lookups | Manufacturers | `MASTER_MANUFACTURER_VIEW` |
| Lookups | Suppliers | `MASTER_SUPPLIER_VIEW` |
| Lookups | Dosage Forms | `MASTER_DOSAGEFORM_VIEW` |
| Master Data | Products | `MASTER_PRODUCT_VIEW` |
| Master Data | Doctors | `MASTER_DOCTOR_VIEW` |
| Email | Inbox, Sent, Drafts, Trash | `EMAIL_ACCESS` |

**Features**: Collapsible sidebar, active route highlighting, user dropdown with logout.

---

#### `ProtectedRoute.tsx`
**Purpose**: Wrapper component that enforces authentication and permission requirements before rendering children.

**Props**:
| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Content to render when authorized |
| `requiredPermission` | `string?` | Single permission code required |
| `requiredPermissions` | `string[]?` | Multiple permissions (OR logic — any one is sufficient) |

**Behavior**:
- Not authenticated → redirect to `/login`
- Auth loading → show spinner
- Permission check fails → redirect to `/unauthorized`
- Passes → render children

---

#### `ProductFormModal.tsx`
**Purpose**: Create and edit product records.

**Props**: `isOpen`, `onClose`, `onSuccess`, `product?` (edit mode), lookup data arrays

**Fields**: Product Code, Name, Generic Name, Category, Manufacturer, Supplier, Dosage Form, Molecule, Tax Type, MRP, Trade Price, Distribution Price, Product Price, Pack Size, UOM, Lifecycle Status

---

#### `DoctorFormModal.tsx`
**Purpose**: Create and edit doctor records.

**Props**: `isOpen`, `onClose`, `onSuccess`, `doctor?` (edit mode), lookup data arrays

**Fields**: Doctor Code, Name, Speciality, Doctor Status Code, GeoRegion, GeoCity, GeoBrick, Phone, Email, Onboarding Date, First Contact Person, Notes, Status

---

#### `DoctorStatusModal.tsx`
**Purpose**: Quick update of a doctor's status code.

**Props**: `isOpen`, `onClose`, `onSuccess`, `doctor`, `statuses[]`

---

#### `ChangePricesModal.tsx`
**Purpose**: Submit a product price change with an effective date.

**Props**: `isOpen`, `onClose`, `onSuccess`, `productCode`, `currentPrices`

**Fields**: Effective Date, SKU Price Code, MRP, Trade Price, Distribution Price, Product Price, Currency, Source, Notes

---

#### `PriceHistoryModal.tsx`
**Purpose**: View historical price records for a product.

**Props**: `isOpen`, `onClose`, `productCode`, `productName`

**Displays**: Price Type, Amount, Effective From, Effective To, Source, Notes, Created By, Created On

---

#### `ComposePanel.tsx`
**Purpose**: Email composition interface.

**Fields**: To, CC, BCC, Subject, Body (HTML)

---

### 4.3 API Modules

All API modules live in `src/lib/`. They use a shared Axios instance configured in `api.ts`.

#### Axios Client (`api.ts`)
- Base URL: `VITE_API_URL` env variable, fallback `http://localhost:5000`
- Automatically attaches `Authorization: Bearer <token>` from localStorage
- On 401 response → clears localStorage, redirects to `/login`

---

#### `authApi` (`src/lib/api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `login(credentials)` | `POST /auth/login` | Authenticate and get JWT token |
| `me()` | `GET /auth/me` | Fetch current user profile |
| `logout()` | `POST /auth/logout` | Invalidate session |

---

#### `usersApi` (`src/lib/api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getAll(search?)` | `GET /users` | List users, optional search |
| `getById(id)` | `GET /users/:id` | Get user detail |
| `create(data)` | `POST /users` | Create user |
| `update(id, data)` | `PUT /users/:id` | Update user |
| `toggleActive(id)` | `PATCH /users/:id/activate` | Toggle active status |
| `resetPassword(id)` | `POST /users/:id/reset-password` | Reset password |
| `assignRoles(id, data)` | `POST /users/:id/roles` | Assign roles |

---

#### `rolesApi` (`src/lib/api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getAll()` | `GET /roles` | List roles |
| `getById(id)` | `GET /roles/:id` | Get role with permissions |
| `create(data)` | `POST /roles` | Create role |
| `update(id, data)` | `PUT /roles/:id` | Update role |
| `delete(id)` | `DELETE /roles/:id` | Delete role |
| `assignPermissions(id, data)` | `POST /roles/:id/permissions` | Set permissions for role |

---

#### `permissionsApi` (`src/lib/api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getAll()` | `GET /permissions` | List all permissions |

---

#### `productCategoriesApi`, `manufacturersApi`, `suppliersApi`, `dosageFormsApi` (`src/lib/api.ts`)
All follow the same CRUD pattern:
| Method | Endpoint | Description |
|---|---|---|
| `getAll(params)` | `GET /<resource>` | Paginated list (search, status, page, pageSize, sortBy, sortDir) |
| `getById(id)` | `GET /<resource>/:id` | Get by ID |
| `create(data)` | `POST /<resource>` | Create |
| `update(id, data)` | `PUT /<resource>/:id` | Update |
| `updateStatus(id, status)` | `PATCH /<resource>/:id/status` | Update status |
| `delete(id)` | `DELETE /<resource>/:id` | Delete |

---

#### `doctorsApi` (`src/lib/doctors-api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getAll(params)` | `GET /doctors` | List with filters |
| `getById(id)` | `GET /doctors/:id` | Get doctor |
| `create(data)` | `POST /doctors` | Create |
| `update(id, data)` | `PUT /doctors/:id` | Update |
| `updateStatus(id, status)` | `PATCH /doctors/:id/status` | Record status |
| `updateDoctorStatusCode(id, code)` | `PATCH /doctors/:id/doctor-status` | Doctor status code |
| `getSpecialities()` | `GET /lookups/specialities` | Speciality lookup |
| `getDoctorStatuses()` | `GET /lookups/doctor-statuses` | Status code lookup |
| `getGeoRegions()` | `GET /lookups/geo-regions` | Region lookup |
| `getGeoCities(regionCode?)` | `GET /lookups/geo-cities` | City lookup |
| `getGeoBricks(cityCode?)` | `GET /lookups/geo-bricks` | Brick lookup |

---

#### `productsApi` (`src/lib/products-api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getAll(params)` | `GET /products` | Paginated list with filters |
| `getById(id)` | `GET /products/:id` | Get product |
| `create(data)` | `POST /products` | Create |
| `update(id, data)` | `PUT /products/:id` | Update |
| `updateLifecycle(id, status)` | `PATCH /products/:id/lifecycle` | Lifecycle status |
| `delete(id)` | `DELETE /products/:id` | Delete (marks discontinued) |
| `getMolecules()` | `GET /molecules` | Molecule lookup |
| `getTaxTypes()` | `GET /taxtypes` | Tax type lookup |
| `getActiveCategories()` | `GET /productcategories?status=Active` | Category lookup |
| `getActiveManufacturers()` | `GET /manufacturers?status=Active` | Manufacturer lookup |
| `getActiveSuppliers()` | `GET /suppliers?status=Active` | Supplier lookup |
| `getActiveDosageForms()` | `GET /dosage-forms?status=Active` | Dosage form lookup |
| `changePrices(code, data)` | `POST /products/:code/change-prices` | Submit price change |
| `getPriceHistory(code)` | `GET /products/:code/price-history` | Price history |
| `getCurrentPrices(code)` | `GET /products/:code/current-prices` | Current prices |

---

#### `emailApi` (`src/lib/api.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `getFolders()` | `GET /email/folders` | List folders |
| `getMessages(params)` | `GET /email/messages` | List messages (folder, page, pageSize, search, unreadOnly, hasAttachment) |
| `getMessage(folder, uid)` | `GET /email/messages/:folder/:uid` | Get message detail |
| `send(data)` | `POST /email/send` | Send email |
| `reply(folder, uid, data)` | `POST /email/reply/:folder/:uid` | Reply |
| `forward(folder, uid, data)` | `POST /email/forward/:folder/:uid` | Forward |
| `deleteMessage(folder, uid)` | `DELETE /email/messages/:folder/:uid` | Delete |
| `markRead(folder, uid, isRead)` | `PATCH /email/messages/:folder/:uid/read` | Mark read/unread |
| `moveMessage(folder, uid, target)` | `PATCH /email/messages/:folder/:uid/move` | Move to folder |
| `getDrafts()` | `GET /email/drafts` | List drafts |
| `getDraft(id)` | `GET /email/drafts/:id` | Get draft |
| `saveDraft(data)` | `POST /email/drafts` | Save draft |
| `updateDraft(id, data)` | `PUT /email/drafts/:id` | Update draft |
| `deleteDraft(id)` | `DELETE /email/drafts/:id` | Delete draft |

---

### 4.4 Types

All TypeScript interfaces are defined in `src/types/index.ts`.

**Authentication**
- `LoginRequest` — `{ usernameOrEmail, password }`
- `UserInfo` — `{ userId, username, email, fullName }`
- `LoginResponse` — `{ token, expiresAt, user, roles, permissions }`
- `UserProfileResponse` — Full profile including roles as `RoleDto[]`
- `RoleDto` — `{ roleId, roleCode, roleName }`

**User Management**
- `UserListResponse` — `{ userId, username, email, fullName, isActive, roles[], lastLoginOn }`
- `UserDetailResponse` — Includes permissions
- `CreateUserRequest` — `{ username, email, fullName, password }`
- `UpdateUserRequest` — `{ email, fullName }`
- `AssignRolesRequest` — `{ roleIds: number[] }`
- `ResetPasswordResponse` — `{ temporaryPassword }`

**Role Management**
- `RoleResponse` — `{ roleId, roleCode, roleName, description, isActive, userCount }`
- `RoleDetailResponse` — Includes `permissions: PermissionDto[]`
- `CreateRoleRequest` — `{ roleCode, roleName, description }`
- `UpdateRoleRequest` — `{ roleName, description }`
- `PermissionDto` — `{ permissionId, permissionCode, permissionName, moduleName, description }`
- `AssignPermissionsRequest` — `{ permissionIds: number[] }`

**Master Data — Products**
- `ProductListResponse` — `{ productId, hontisProductCode, productName, categoryName, manufacturerName, lifecycleStatus, mrp, tradePrice }`
- `ProductDetailResponse` — Full product with all fields
- `CreateProductRequest` / `UpdateProductRequest` — All product fields
- `UpdateProductLifecycleRequest` — `{ lifecycleStatus }`
- `ChangePricesRequest` — `{ effectiveDate, skuPriceCode, mrp, tradePrice, distributionPrice, productPrice, currency, source, notes }`
- `CurrentPricesResponse` — `{ mrp, tradePrice, distributionPrice, productPrice, effectiveFrom }`
- `PriceHistoryResponse` — Array of price records

**Master Data — Doctors**
- `DoctorListResponse` — `{ doctorId, doctorCode, doctorName, specialityName, doctorStatusCode, city, isActive }`
- `DoctorDetailResponse` — Full detail
- `CreateDoctorRequest` / `UpdateDoctorRequest` — All doctor fields
- Geographic lookups: `GeoRegionLookupResponse`, `GeoCityLookupResponse`, `GeoBrickLookupResponse`

**Email**
- `EmailFolderDto`, `EmailAttachmentDto`, `EmailMessageSummaryDto`, `EmailMessageDetailDto`
- `EmailPagedResult<T>` — Paginated email wrapper
- `SendEmailRequest`, `ReplyEmailRequest`, `ForwardEmailRequest`
- `DraftListDto`, `DraftDetailDto`, `SaveDraftRequest`

**Utility**
- `PagedResult<T>` — `{ items: T[], totalCount, page, pageSize, totalPages }`

---

### 4.5 Auth Context

**File**: `src/contexts/AuthContext.tsx`

| Member | Type | Description |
|---|---|---|
| `user` | `UserProfileResponse \| null` | Current authenticated user |
| `isLoading` | `boolean` | True during initial auth check |
| `isAuthenticated` | `boolean` | Whether user has valid session |
| `login(credentials)` | `function` | Authenticate user, store token |
| `logout()` | `function` | Clear token and user state |
| `hasPermission(code)` | `function` | Returns true if user has exact permission |
| `hasAnyPermission(codes[])` | `function` | Returns true if user has any of the listed permissions |

**Initialization**: On mount, reads token from `localStorage`, calls `authApi.me()` to hydrate user state.

---

### 4.6 Routing

**File**: `src/App.tsx`

| Route | Component | Permission Required |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/unauthorized` | `UnauthorizedPage` | Public |
| `/dashboard` | `DashboardPage` | Authenticated |
| `/users` | `UsersPage` | `USER_READ` |
| `/roles` | `RolesPage` | `ROLE_READ` |
| `/permissions` | `PermissionsPage` | Authenticated |
| `/role-permission-matrix` | `RolePermissionMatrixPage` | `ROLE_ASSIGN_PERMISSIONS` |
| `/master/product-categories` | `ProductCategoriesPage` | `MASTER_PRODUCT_VIEW` |
| `/master/manufacturers` | `ManufacturersPage` | `MASTER_MANUFACTURER_VIEW` |
| `/master/suppliers` | `SuppliersPage` | `MASTER_SUPPLIER_VIEW` |
| `/master/dosage-forms` | `DosageFormsPage` | `MASTER_DOSAGEFORM_VIEW` |
| `/master/products` | `ProductsPage` | `MASTER_PRODUCT_VIEW` |
| `/master/doctors` | `DoctorsPage` | `MASTER_DOCTOR_VIEW` |
| `/email/drafts` | `EmailPage` | `EMAIL_ACCESS` |
| `/email/:folder` | `EmailPage` | `EMAIL_ACCESS` |
| `/email/:folder/:messageId` | `EmailPage` | `EMAIL_ACCESS` |

Root `/` redirects to `/dashboard`.
Unknown authenticated routes fall through to the layout (no explicit 404 page defined).

---

## 5. Backend Structure

### 5.1 Controllers

All controllers are under `backend/HontisHSAC.API/Controllers/`. They use `[Authorize]` globally and individual actions use `[RequirePermission("PERMISSION_CODE")]`.

---

#### `AuthController.cs`
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate, returns JWT token |
| `GET` | `/api/auth/me` | Returns full profile of the authenticated user |
| `POST` | `/api/auth/logout` | Logs out (server-side session cleanup) |

---

#### `UsersController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/users` | `USER_READ` | List users, optional `?search=` |
| `GET` | `/api/users/{id}` | `USER_READ` | Get user by ID |
| `POST` | `/api/users` | `USER_CREATE` | Create user |
| `PUT` | `/api/users/{id}` | `USER_UPDATE` | Update user |
| `PATCH` | `/api/users/{id}/activate` | `USER_ACTIVATE` | Toggle active |
| `POST` | `/api/users/{id}/reset-password` | `USER_ADMIN` | Reset password |
| `POST` | `/api/users/{id}/roles` | `USER_ADMIN` | Assign roles |

---

#### `RolesController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/roles` | `ROLE_READ` | List roles |
| `GET` | `/api/roles/{id}` | `ROLE_READ` | Get role with permissions |
| `POST` | `/api/roles` | `ROLE_CREATE` | Create role |
| `PUT` | `/api/roles/{id}` | `ROLE_UPDATE` | Update role |
| `DELETE` | `/api/roles/{id}` | `ROLE_DELETE` | Delete role |
| `POST` | `/api/roles/{id}/permissions` | `ROLE_ASSIGN_PERMISSIONS` | Assign permissions |

---

#### `PermissionsController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/permissions` | Authenticated | List all permissions |

---

#### `ProductCategoriesController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/productcategories` | `MASTER_PRODUCT_VIEW` | Paginated list (search, status, page, pageSize, sortBy, sortDir) |
| `GET` | `/api/productcategories/{id}` | `MASTER_PRODUCT_VIEW` | Get by ID |
| `POST` | `/api/productcategories` | `MASTER_PRODUCT_EDIT` | Create |
| `PUT` | `/api/productcategories/{id}` | `MASTER_PRODUCT_EDIT` | Update |
| `PATCH` | `/api/productcategories/{id}/status` | `MASTER_PRODUCT_EDIT` | Update status |
| `DELETE` | `/api/productcategories/{id}` | `MASTER_PRODUCT_DELETE` | Delete |

Manufacturers (`/api/manufacturers`), Suppliers (`/api/suppliers`), Dosage Forms (`/api/dosage-forms`) follow the same pattern with their respective permission codes (`MASTER_MANUFACTURER_*`, `MASTER_SUPPLIER_*`, `MASTER_DOSAGEFORM_*`).

---

#### `ProductsController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/products` | `MASTER_PRODUCT_VIEW` | List with filters |
| `GET` | `/api/products/{id}` | `MASTER_PRODUCT_VIEW` | Get product |
| `POST` | `/api/products` | `MASTER_PRODUCT_EDIT` | Create |
| `PUT` | `/api/products/{id}` | `MASTER_PRODUCT_EDIT` | Update |
| `PATCH` | `/api/products/{id}/lifecycle` | `MASTER_PRODUCT_EDIT` | Lifecycle status |
| `DELETE` | `/api/products/{id}` | `MASTER_PRODUCT_DELETE` | Delete |
| `POST` | `/api/products/{code}/change-prices` | `MASTER_PRODUCT_EDIT` | Price change |
| `GET` | `/api/products/{code}/price-history` | `MASTER_PRODUCT_VIEW` | Price history |
| `GET` | `/api/products/{code}/current-prices` | `MASTER_PRODUCT_VIEW` | Current prices |

---

#### `DoctorsController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | `MASTER_DOCTOR_VIEW` | List with filters |
| `GET` | `/api/doctors/{id}` | `MASTER_DOCTOR_VIEW` | Get doctor |
| `POST` | `/api/doctors` | `MASTER_DOCTOR_EDIT` | Create |
| `PUT` | `/api/doctors/{id}` | `MASTER_DOCTOR_EDIT` | Update |
| `PATCH` | `/api/doctors/{id}/status` | `MASTER_DOCTOR_EDIT` | Record status |
| `PATCH` | `/api/doctors/{id}/doctor-status` | `MASTER_DOCTOR_EDIT` | Doctor status code |

---

#### `LookupsController.cs`
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/lookups/specialities` | Speciality list |
| `GET` | `/api/lookups/doctor-statuses` | Doctor status list |
| `GET` | `/api/lookups/geo-regions` | Region list |
| `GET` | `/api/lookups/geo-cities?regionCode=` | City list (optional filter) |
| `GET` | `/api/lookups/geo-bricks?cityCode=` | Brick list (optional filter) |

---

#### `EmailController.cs`
| Method | Route | Permission | Description |
|---|---|---|---|
| All | `/api/email/*` | `EMAIL_ACCESS` | Full email client API |

---

### 5.2 Services

Service interfaces are in `HontisHSAC.Application/Interfaces/`. Implementations are in `HontisHSAC.Application/Services/`.

| Interface | Implementation | Responsibility |
|---|---|---|
| `IAuthenticationService` | `AuthenticationService` | Login, JWT issuance |
| `IUserService` | `UserService` | User CRUD, role assignment, password reset |
| `IRoleService` | `RoleService` | Role CRUD, permission assignment |
| `IProductService` | `ProductService` | Product CRUD, lifecycle, price changes |
| `IDoctorService` | `DoctorService` | Doctor CRUD, status management |
| `IProductCategoryService` | `ProductCategoryService` | Category CRUD |
| `IManufacturerService` | `ManufacturerService` | Manufacturer CRUD |
| `ISupplierService` | `SupplierService` | Supplier CRUD |
| `IDosageFormService` | `DosageFormService` | Dosage form CRUD |
| `ILookupService` | `LookupService` | Read-only lookup data |
| `IEmailService` | `EmailService` | IMAP/SMTP operations |
| `IJwtTokenService` | `JwtTokenService` | Token generation and validation |

---

### 5.3 Entities

Located in `HontisHSAC.Core/Entities/`. All extend `TEntity` (base with audit fields).

| Entity | Table | Key Fields |
|---|---|---|
| `AppUser` | `AppUsers` | UserId, Username, Email, PasswordHash, IsActive |
| `AppRole` | `AppRoles` | RoleId, RoleCode, RoleName |
| `AppPermission` | `AppPermissions` | PermissionId, PermissionCode, ModuleName |
| `AppUserRole` | `AppUserRoles` | UserId, RoleId (junction) |
| `AppRolePermission` | `AppRolePermissions` | RoleId, PermissionId (junction) |
| `ProductMaster` | `ProductMasters` | HontisProductCode, ProductName, LifecycleStatus |
| `ProductPriceHistory` | `ProductPriceHistories` | HontisProductCode, EffectiveDate, Price fields |
| `DoctorMaster` | `DoctorMasters` | DoctorCode, DoctorName, SpecialityCode, DoctorStatusCode |
| `Manufacturer` | `Manufacturers` | ManufacturerCode, ManufacturerName, Country |
| `Supplier` | `Suppliers` | SupplierCode, SupplierName |
| `ProductCategory` | `ProductCategories` | CategoryCode, CategoryName |
| `DosageForm` | `DosageForms` | DosageFormCode, DosageFormName |
| `Molecule` | `Molecules` | MoleculeCode, MoleculeName |
| `TaxType` | `TaxTypes` | TaxTypeCode, TaxTypeName, TaxPercent |
| `GeoRegion` | `GeoRegions` | RegionCode, RegionName |
| `GeoCity` | `GeoCities` | CityCode, CityName, RegionCode |
| `GeoBrick` | `GeoBricks` | BrickCode, BrickName, CityCode |
| `EmailAccount` | `EmailAccounts` | IMAP/SMTP configuration |
| `EmailDraft` | `EmailDrafts` | Draft content |
| `EmailSentLog` | `EmailSentLogs` | Sent message tracking |
| `SecurityAuditLog` | `SecurityAuditLogs` | EventType, ActorUserId, EventData (JSONB) |
| `Speciality` | `Specialities` | SpecialityCode, SpecialityName |
| `DoctorStatus` | `DoctorStatuses` | StatusCode, StatusName |

---

### 5.4 DTOs

Located in `HontisHSAC.Application/DTOs/`.

| File | Contents |
|---|---|
| `AuthDtos.cs` | `LoginRequestDto`, `LoginResponseDto`, `UserProfileDto` |
| `UserDtos.cs` | `UserListDto`, `CreateUserDto`, `UpdateUserDto`, `AssignRolesDto`, `ResetPasswordResultDto` |
| `RoleDtos.cs` | `RoleListDto`, `RoleDetailDto`, `CreateRoleDto`, `UpdateRoleDto`, `AssignPermissionsDto` |
| `ProductDtos.cs` | `ProductListDto`, `ProductDetailDto`, `CreateProductDto`, `UpdateProductDto`, `ChangePricesDto`, `PriceHistoryDto` |
| `DoctorDtos.cs` | `DoctorListDto`, `DoctorDetailDto`, `CreateDoctorDto`, `UpdateDoctorDto` |
| `ProductCategoryDtos.cs` | Standard CRUD DTOs |
| `ManufacturerDtos.cs` | Standard CRUD DTOs |
| `SupplierDtos.cs` | Standard CRUD DTOs |
| `DosageFormDtos.cs` | Standard CRUD DTOs |
| `EmailDtos.cs` | Folder, message, draft, send, reply, forward DTOs |

---

### 5.5 Authorization

**File**: `HontisHSAC.API/Authorization/RequirePermissionAttribute.cs`

Custom ASP.NET attribute applied to controller actions. Reads the JWT claims and verifies the user holds the required permission code.

**JWT Structure**: The token payload includes user ID, username, roles array, and permissions array (flat list of permission codes).

---

## 6. Database Schema

**Migration file**: `supabase/migrations/20260125043134_001_initial_create.sql`

### Core RBAC Tables

```sql
AppUsers       → UserId (PK), Username, Email, FullName, PasswordHash, IsActive, LastLoginOn
AppRoles       → RoleId (PK), RoleCode (unique), RoleName, Description, IsActive
AppPermissions → PermissionId (PK), PermissionCode (unique), PermissionName, ModuleName, Description
AppUserRoles   → UserRoleId (PK), UserId (FK), RoleId (FK), IsActive  [UNIQUE(UserId, RoleId)]
AppRolePermissions → RolePermissionId (PK), RoleId (FK), PermissionId (FK), IsActive  [UNIQUE(RoleId, PermissionId)]
SecurityAuditLogs → AuditId (PK), EventType, ActorUserId (FK), TargetUserId (FK), EventData (JSONB)
```

### All tables include audit fields
- `CreatedOn TIMESTAMPTZ DEFAULT now()`
- `CreatedBy VARCHAR(100)`
- `UpdatedOn TIMESTAMPTZ` (nullable)
- `UpdatedBy VARCHAR(100)` (nullable)

### Indexes
Created on all foreign keys and unique constraint columns for query performance.

---

## 7. Permissions Reference

| Permission Code | Module | Description |
|---|---|---|
| `USER_READ` | User Management | View users |
| `USER_CREATE` | User Management | Create new users |
| `USER_UPDATE` | User Management | Edit user details |
| `USER_ACTIVATE` | User Management | Activate/deactivate users |
| `USER_ADMIN` | User Management | Reset passwords, assign roles |
| `ROLE_READ` | Role Management | View roles |
| `ROLE_CREATE` | Role Management | Create roles |
| `ROLE_UPDATE` | Role Management | Edit roles |
| `ROLE_DELETE` | Role Management | Delete roles |
| `ROLE_ADMIN` | Role Management | Full role administration |
| `ROLE_ASSIGN_PERMISSIONS` | Role Management | Assign permissions to roles |
| `MASTER_PRODUCT_VIEW` | Master Data | View products and categories |
| `MASTER_PRODUCT_EDIT` | Master Data | Create/edit products and categories |
| `MASTER_PRODUCT_DELETE` | Master Data | Delete products and categories |
| `MASTER_MANUFACTURER_VIEW` | Master Data | View manufacturers |
| `MASTER_MANUFACTURER_EDIT` | Master Data | Create/edit manufacturers |
| `MASTER_MANUFACTURER_DELETE` | Master Data | Delete manufacturers |
| `MASTER_SUPPLIER_VIEW` | Master Data | View suppliers |
| `MASTER_SUPPLIER_EDIT` | Master Data | Create/edit suppliers |
| `MASTER_SUPPLIER_DELETE` | Master Data | Delete suppliers |
| `MASTER_DOSAGEFORM_VIEW` | Master Data | View dosage forms |
| `MASTER_DOSAGEFORM_EDIT` | Master Data | Create/edit dosage forms |
| `MASTER_DOSAGEFORM_DELETE` | Master Data | Delete dosage forms |
| `MASTER_DOCTOR_VIEW` | Master Data | View doctors |
| `MASTER_DOCTOR_EDIT` | Master Data | Create/edit doctors |
| `EMAIL_ACCESS` | Email | Access email client |

---

## 8. Developer Guide

### Adding a New Page

1. Create `src/pages/NewPage.tsx` with its own data fetching logic
2. Add route in `src/App.tsx` wrapped in `<ProtectedRoute requiredPermission="PERMISSION_CODE">`
3. Add navigation entry in `src/components/AppLayout.tsx` under the appropriate group
4. Add the required permission code to `src/types/index.ts` if not already present
5. Add corresponding backend controller endpoint and `[RequirePermission]` attributes

### Adding a New API Call

1. Add the TypeScript types to `src/types/index.ts`
2. Add the method to the appropriate API module in `src/lib/`
3. Call via React Query (`useQuery` for GET, `useMutation` for POST/PUT/PATCH/DELETE)

### Adding a New Permission

1. Add permission record to the database via migration
2. Add `[RequirePermission("NEW_CODE")]` to the backend endpoint
3. Add the permission code constant to `src/types/index.ts` if needed
4. Update `AppLayout.tsx` if the new permission gates a navigation item
5. Update `ProtectedRoute` usage in `App.tsx` if it gates a route

### Running Type Checks

```bash
npm run typecheck
```

### Building for Production

```bash
npm run build
```

### Code Conventions

- Tailwind CSS utility classes for all styling (no separate CSS files except `src/index.css`)
- Lucide React for all icons
- React Hook Form + Zod for all forms and validation
- TanStack React Query for all server state
- Modals use a local `isOpen` boolean state pattern
- All API calls go through `src/lib/` — never call axios directly from components
- No global variables; all shared state via Context or React Query cache

---

## 9. Tester Guide

### 9.1 Test Accounts

| Username | Password | Role | Access Level |
|---|---|---|---|
| `admin` | `Admin@123` | Super Admin | Full access to everything |

To test with restricted users, create new users via the Users page and assign only specific roles.

---

### 9.2 Test Scenarios

---

#### Authentication

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| A1 | Valid login | Enter `admin` / `Admin@123`, click Login | Redirected to Dashboard, user profile shown |
| A2 | Invalid credentials | Enter wrong password, click Login | Error message displayed, no redirect |
| A3 | Empty form submit | Submit form without entering credentials | Validation error shown on required fields |
| A4 | Session persistence | Login, close and reopen tab | User remains logged in (token in localStorage) |
| A5 | Logout | Click logout from user menu | Redirected to login, localStorage cleared |
| A6 | Expired token | Manually expire/delete token from localStorage, perform action | Redirected to login page |

---

#### User Management (`/users`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| U1 | View users | Navigate to Users page | User list loads with name, email, roles, status |
| U2 | Search users | Enter name/email in search box | List filters in real-time or on submit |
| U3 | Create user | Click Add User, fill form, submit | User appears in list |
| U4 | Create duplicate username | Create user with existing username | Error message shown |
| U5 | Edit user | Click edit icon, modify email/fullName, save | Changes reflected immediately |
| U6 | Deactivate user | Click toggle active button | Status changes to Inactive; user cannot log in |
| U7 | Reactivate user | Click toggle on inactive user | Status changes to Active |
| U8 | Reset password | Click reset password | Modal shows temporary password |
| U9 | Assign roles | Click assign roles, select roles, save | Roles appear on user record |
| U10 | Remove all roles | Unassign all roles from user | User has no roles |

---

#### Role Management (`/roles`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| R1 | View roles | Navigate to Roles page | Roles shown as cards with user count |
| R2 | Create role | Click Add Role, fill code/name/description, save | Role card appears |
| R3 | Duplicate role code | Create with existing code | Error message |
| R4 | Edit role name | Click edit, change name, save | Name updated |
| R5 | Edit role code | Try to change code in edit form | Code field disabled/immutable |
| R6 | Delete role with users | Try to delete a role that has users | Error: cannot delete |
| R7 | Delete unused role | Delete role with no users | Role removed |

---

#### Role-Permission Matrix (`/role-permission-matrix`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| P1 | View matrix | Navigate to page | Grid of roles vs. permissions |
| P2 | Grant permission | Click unchecked checkbox | Checkbox turns green (unsaved change counter increments) |
| P3 | Revoke permission | Click checked checkbox | Checkbox turns red (unsaved change counter increments) |
| P4 | Save changes | Click Save | Changes persisted, visual feedback returns to normal |
| P5 | Cancel changes | Make changes, click Cancel | All changes reverted to saved state |
| P6 | Multiple roles | Grant/revoke for multiple roles before save | All changes saved in one operation |

---

#### Product Categories (`/master/product-categories`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| PC1 | View list | Navigate to page | Paginated list loads |
| PC2 | Search | Type in search box | List filters to matching categories |
| PC3 | Filter by status | Select Active/Inactive filter | Only matching status shown |
| PC4 | Create | Click Add, fill form, save | Category appears in list |
| PC5 | Edit | Click edit, update name, save | Name updated |
| PC6 | Update status | Click status toggle | Status changes inline |
| PC7 | Delete | Click delete, confirm | Category removed from list |
| PC8 | Sort columns | Click column header | List sorts by that column |
| PC9 | Pagination | Navigate pages | Different records appear |

Same test structure applies for: **Manufacturers**, **Suppliers**, **Dosage Forms**

---

#### Products (`/master/products`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| PR1 | View list | Navigate to page | Product list with status badges |
| PR2 | Filter by lifecycle | Select Draft/Active/Inactive/Discontinued | List filters accordingly |
| PR3 | Filter by category | Select a category | Only that category's products shown |
| PR4 | Create product | Click Add, fill all required fields, save | Product appears in list |
| PR5 | Edit product | Click edit, modify fields, save | Changes saved |
| PR6 | Change prices | Click change price icon, fill form with effective date, submit | Price history record created |
| PR7 | View price history | Click price history icon | Modal shows all historical prices |
| PR8 | Update lifecycle | Click lifecycle button, change status, save | Badge updates on list |
| PR9 | Delete product | Click delete, confirm | Product marked discontinued |
| PR10 | Current prices | After price change, verify current prices reflect update | New prices shown |

---

#### Doctors (`/master/doctors`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| D1 | View list | Navigate to page | Doctor list loads |
| D2 | Filter by speciality | Select a speciality | Only matching doctors shown |
| D3 | Filter by status code | Select Prospect/Active/Inactive/Blocked | Filtered list |
| D4 | Filter by city | Select a city | Doctors in that city shown |
| D5 | Create doctor | Click Add, fill required fields, save | Doctor appears in list |
| D6 | Edit doctor | Click edit, modify fields, save | Changes saved |
| D7 | Update doctor status code | Click status update, change code, save | Status code updated |
| D8 | Toggle record status | Click active toggle | Status changes Active/Inactive |
| D9 | Geographic cascade | Select region → only that region's cities shown → only that city's bricks | Cascading filters work correctly |

---

#### Permission-Based Access Control

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| AC1 | No USER_READ | Create user with no user permissions, log in | Users menu item not visible |
| AC2 | Direct URL access | As user without permission, navigate directly to `/users` | Redirected to `/unauthorized` |
| AC3 | No ROLE_READ | User without role permissions | Roles menu not visible |
| AC4 | EMAIL_ACCESS gate | User without EMAIL_ACCESS | Email menu not visible; direct URL redirects to unauthorized |
| AC5 | Partial permissions | User with MASTER_PRODUCT_VIEW but not EDIT | Can view products, Add/Edit/Delete buttons hidden or disabled |

---

#### Email (`/email/inbox`)

| # | Scenario | Steps | Expected Result |
|---|---|---|---|
| E1 | View inbox | Navigate to email | Folder list and message list shown |
| E2 | Open message | Click a message | Message detail panel opens |
| E3 | Mark as read | Open an unread message | Message marked as read |
| E4 | Compose | Click Compose, fill To/Subject/Body, send | Email sent |
| E5 | Save draft | Compose email, save as draft | Appears in Drafts folder |
| E6 | Delete message | Click delete on a message | Message moves to Trash |
| E7 | Move message | Move a message to a folder | Message appears in target folder |

---

#### Edge Cases & Validation

| # | Scenario | Expected Result |
|---|---|---|
| EG1 | Submit empty required fields | Field-level validation errors shown |
| EG2 | Duplicate unique codes (role code, product code, etc.) | API error displayed to user |
| EG3 | Delete record in use | API error: record is referenced |
| EG4 | Network error during save | Error notification shown; form data preserved |
| EG5 | Large data sets | Pagination works correctly; no UI freeze |
| EG6 | Special characters in search | No crashes; search handles URL encoding |
| EG7 | Concurrent edits | Second save wins; no silent data loss |

---

## 10. Known Patterns & Conventions

### State Management Strategy
- **Auth State**: React Context (`AuthContext`) — singleton, app-wide
- **Server State**: TanStack React Query — automatic caching and invalidation
- **Form State**: React Hook Form — local to each modal/form component
- **UI State**: `useState` — local to each component (modals open/close, loading, errors)

### Error Handling
- API errors surface via Axios response interceptors
- 401 → automatic redirect to login
- Other errors → displayed as inline error messages in forms or as toast-style alerts

### Pagination Pattern
All list pages follow the same parameters:
```
page (1-based), pageSize, sortBy, sortDir (asc/desc), search, status
```

### Modal Pattern
All create/edit operations use modals with:
- `isOpen: boolean` prop
- `onClose: () => void` prop
- `onSuccess: () => void` prop (triggers React Query cache invalidation)
- Optional entity prop for edit mode

### Permission Checking in UI
```tsx
// Hide elements the user can't use
{hasPermission('USER_CREATE') && <button>Add User</button>}
{hasAnyPermission(['ROLE_ADMIN', 'ROLE_READ']) && <NavItem />}
```

### API Query Parameters for List Endpoints
```
GET /api/resource?search=&status=&page=1&pageSize=20&sortBy=name&sortDir=asc
```

### Token Storage
JWT token stored in `localStorage` under key `token`. User profile cached under key `user`.
**Security note**: Consider migrating to `httpOnly` cookies for improved XSS protection in production.

---

*Document generated: 2026-02-19*
*Project: Hontis HSAC Admin Portal*

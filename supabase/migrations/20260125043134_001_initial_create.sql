/*
  # Initial Database Schema for Hontis HSAC

  ## New Tables
  
  ### AppUsers
  - UserId (PK): Integer, auto-increment
  - Username: String (100 chars, unique, required)
  - Email: String (255 chars, unique, required)
  - FullName: String (255 chars, required)
  - PasswordHash: Text (required)
  - IsActive: Boolean (default true)
  - LastLoginOn: Timestamp with timezone (nullable)
  - CreatedOn: Timestamp with timezone (default now)
  - CreatedBy: String (100 chars)
  - UpdatedOn: Timestamp with timezone (nullable)
  - UpdatedBy: String (100 chars, nullable)

  ### AppRoles
  - RoleId (PK): Integer, auto-increment
  - RoleCode: String (50 chars, unique, required)
  - RoleName: String (100 chars, required)
  - Description: String (500 chars, nullable)
  - IsActive: Boolean (default true)
  - CreatedOn: Timestamp with timezone (default now)
  - CreatedBy: String (100 chars)
  - UpdatedOn: Timestamp with timezone (nullable)
  - UpdatedBy: String (100 chars, nullable)

  ### AppPermissions
  - PermissionId (PK): Integer, auto-increment
  - PermissionCode: String (50 chars, unique, required)
  - PermissionName: String (100 chars, required)
  - ModuleName: String (100 chars, required)
  - Description: String (500 chars, nullable)
  - IsActive: Boolean (default true)
  - CreatedOn: Timestamp with timezone (default now)

  ### AppUserRoles
  - UserRoleId (PK): Integer, auto-increment
  - UserId (FK): Integer (references AppUsers)
  - RoleId (FK): Integer (references AppRoles)
  - IsActive: Boolean (default true)
  - AssignedOn: Timestamp with timezone (default now)
  - AssignedBy: String (100 chars)
  - UNIQUE constraint on (UserId, RoleId)

  ### AppRolePermissions
  - RolePermissionId (PK): Integer, auto-increment
  - RoleId (FK): Integer (references AppRoles)
  - PermissionId (FK): Integer (references AppPermissions)
  - IsActive: Boolean (default true)
  - GrantedOn: Timestamp with timezone (default now)
  - GrantedBy: String (100 chars)
  - UNIQUE constraint on (RoleId, PermissionId)

  ### SecurityAuditLogs
  - AuditId (PK): Integer, auto-increment
  - EventType: String (100 chars, required)
  - ActorUserId (FK): Integer (references AppUsers, nullable)
  - TargetUserId (FK): Integer (references AppUsers, nullable)
  - EventData: JSONB (nullable)
  - CreatedOn: Timestamp with timezone (default now)

  ## Indexes
  - Unique indexes on Username and Email in AppUsers
  - Unique index on RoleCode in AppRoles
  - Unique index on PermissionCode in AppPermissions
  - Composite unique indexes on UserRoles and RolePermissions

  ## Security
  - All tables are created without RLS as this is an admin API with JWT-based auth
*/

-- Create AppUsers table
CREATE TABLE IF NOT EXISTS "AppUsers" (
    "UserId" SERIAL PRIMARY KEY,
    "Username" VARCHAR(100) NOT NULL UNIQUE,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "FullName" VARCHAR(255) NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "LastLoginOn" TIMESTAMPTZ,
    "CreatedOn" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "CreatedBy" VARCHAR(100) NOT NULL DEFAULT 'system',
    "UpdatedOn" TIMESTAMPTZ,
    "UpdatedBy" VARCHAR(100)
);

-- Create AppRoles table
CREATE TABLE IF NOT EXISTS "AppRoles" (
    "RoleId" SERIAL PRIMARY KEY,
    "RoleCode" VARCHAR(50) NOT NULL UNIQUE,
    "RoleName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedOn" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "CreatedBy" VARCHAR(100) NOT NULL DEFAULT 'system',
    "UpdatedOn" TIMESTAMPTZ,
    "UpdatedBy" VARCHAR(100)
);

-- Create AppPermissions table
CREATE TABLE IF NOT EXISTS "AppPermissions" (
    "PermissionId" SERIAL PRIMARY KEY,
    "PermissionCode" VARCHAR(50) NOT NULL UNIQUE,
    "PermissionName" VARCHAR(100) NOT NULL,
    "ModuleName" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedOn" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AppUserRoles junction table
CREATE TABLE IF NOT EXISTS "AppUserRoles" (
    "UserRoleId" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "AppUsers"("UserId") ON DELETE CASCADE,
    "RoleId" INTEGER NOT NULL REFERENCES "AppRoles"("RoleId") ON DELETE CASCADE,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "AssignedOn" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "AssignedBy" VARCHAR(100) NOT NULL DEFAULT 'system',
    CONSTRAINT "UQ_AppUserRoles_UserId_RoleId" UNIQUE ("UserId", "RoleId")
);

-- Create AppRolePermissions junction table
CREATE TABLE IF NOT EXISTS "AppRolePermissions" (
    "RolePermissionId" SERIAL PRIMARY KEY,
    "RoleId" INTEGER NOT NULL REFERENCES "AppRoles"("RoleId") ON DELETE CASCADE,
    "PermissionId" INTEGER NOT NULL REFERENCES "AppPermissions"("PermissionId") ON DELETE CASCADE,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "GrantedOn" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "GrantedBy" VARCHAR(100) NOT NULL DEFAULT 'system',
    CONSTRAINT "UQ_AppRolePermissions_RoleId_PermissionId" UNIQUE ("RoleId", "PermissionId")
);

-- Create SecurityAuditLogs table
CREATE TABLE IF NOT EXISTS "SecurityAuditLogs" (
    "AuditId" SERIAL PRIMARY KEY,
    "EventType" VARCHAR(100) NOT NULL,
    "ActorUserId" INTEGER REFERENCES "AppUsers"("UserId") ON DELETE SET NULL,
    "TargetUserId" INTEGER REFERENCES "AppUsers"("UserId") ON DELETE SET NULL,
    "EventData" JSONB,
    "CreatedOn" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "IX_AppUsers_Username" ON "AppUsers"("Username");
CREATE INDEX IF NOT EXISTS "IX_AppUsers_Email" ON "AppUsers"("Email");
CREATE INDEX IF NOT EXISTS "IX_AppRoles_RoleCode" ON "AppRoles"("RoleCode");
CREATE INDEX IF NOT EXISTS "IX_AppPermissions_PermissionCode" ON "AppPermissions"("PermissionCode");
CREATE INDEX IF NOT EXISTS "IX_AppUserRoles_UserId" ON "AppUserRoles"("UserId");
CREATE INDEX IF NOT EXISTS "IX_AppUserRoles_RoleId" ON "AppUserRoles"("RoleId");
CREATE INDEX IF NOT EXISTS "IX_AppRolePermissions_RoleId" ON "AppRolePermissions"("RoleId");
CREATE INDEX IF NOT EXISTS "IX_AppRolePermissions_PermissionId" ON "AppRolePermissions"("PermissionId");
CREATE INDEX IF NOT EXISTS "IX_SecurityAuditLogs_ActorUserId" ON "SecurityAuditLogs"("ActorUserId");
CREATE INDEX IF NOT EXISTS "IX_SecurityAuditLogs_TargetUserId" ON "SecurityAuditLogs"("TargetUserId");
CREATE INDEX IF NOT EXISTS "IX_SecurityAuditLogs_EventType" ON "SecurityAuditLogs"("EventType");

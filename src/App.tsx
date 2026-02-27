import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { RolePermissionMatrixPage } from './pages/RolePermissionMatrixPage';
import { ProductCategoriesPage } from './pages/ProductCategoriesPage';
import { ManufacturersPage } from './pages/ManufacturersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { DosageFormsPage } from './pages/DosageFormsPage';
import { ProductsPage } from './pages/ProductsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { EmailPage } from './pages/EmailPage';
import { AttributionOverviewPage } from './pages/AttributionOverviewPage';
import { AttributionRulesPage } from './pages/AttributionRulesPage';
import { AttributionAllocationsPage } from './pages/AttributionAllocationsPage';
import { AttributionResultsPage } from './pages/AttributionResultsPage';
import { AttributionExceptionsPage } from './pages/AttributionExceptionsPage';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermission="USER_READ">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredPermission="ROLE_READ">
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route
          path="role-permission-matrix"
          element={
            <ProtectedRoute requiredPermission="ROLE_ASSIGN_PERMISSIONS">
              <RolePermissionMatrixPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/product-categories"
          element={
            <ProtectedRoute requiredPermission="MASTER_PRODUCT_VIEW">
              <ProductCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/manufacturers"
          element={
            <ProtectedRoute requiredPermission="MASTER_MANUFACTURER_VIEW">
              <ManufacturersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/suppliers"
          element={
            <ProtectedRoute requiredPermission="MASTER_SUPPLIER_VIEW">
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/dosage-forms"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOSAGEFORM_VIEW">
              <DosageFormsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/products"
          element={
            <ProtectedRoute requiredPermission="MASTER_PRODUCT_VIEW">
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="master/doctors"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attribution/overview"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <AttributionOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attribution/rules"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <AttributionRulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attribution/allocations"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <AttributionAllocationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attribution/results"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <AttributionResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attribution/exceptions"
          element={
            <ProtectedRoute requiredPermission="MASTER_DOCTOR_VIEW">
              <AttributionExceptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="email/drafts"
          element={
            <ProtectedRoute requiredPermission="EMAIL_ACCESS">
              <EmailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="email/:folder"
          element={
            <ProtectedRoute requiredPermission="EMAIL_ACCESS">
              <EmailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="email/:folder/:messageId"
          element={
            <ProtectedRoute requiredPermission="EMAIL_ACCESS">
              <EmailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

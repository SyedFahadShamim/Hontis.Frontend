import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Grid3x3,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Package,
  Building2,
  Truck,
  Pill,
  ShoppingCart,
  Stethoscope,
  Mail,
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Network,
  ListChecks,
  GitMerge,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'Administration',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
        { path: '/users', label: 'Users', icon: Users, show: hasPermission('USER_READ') },
        { path: '/roles', label: 'Roles', icon: Shield, show: hasPermission('ROLE_READ') },
        { path: '/permissions', label: 'Permissions', icon: Key, show: true },
        { path: '/role-permission-matrix', label: 'Role-Permission Matrix', icon: Grid3x3, show: hasPermission('ROLE_ASSIGN_PERMISSIONS') },
      ],
    },
    {
      label: 'Lookups',
      items: [
        { path: '/master/product-categories', label: 'Product Categories', icon: Package, show: hasPermission('MASTER_PRODUCT_VIEW') },
        { path: '/master/manufacturers', label: 'Manufacturers', icon: Building2, show: hasPermission('MASTER_MANUFACTURER_VIEW') },
        { path: '/master/suppliers', label: 'Suppliers', icon: Truck, show: hasPermission('MASTER_SUPPLIER_VIEW') },
        { path: '/master/dosage-forms', label: 'Dosage Forms', icon: Pill, show: hasPermission('MASTER_DOSAGEFORM_VIEW') },
      ],
    },
    {
      label: 'Master Data',
      items: [
        { path: '/master/products', label: 'Products', icon: ShoppingCart, show: hasPermission('MASTER_PRODUCT_VIEW') },
        { path: '/master/doctors', label: 'Doctors', icon: Stethoscope, show: hasPermission('MASTER_DOCTOR_VIEW') },
      ],
    },
    {
      label: 'Sales Attribution',
      items: [
        { path: '/attribution/overview', label: 'Overview', icon: Network, show: hasPermission('MASTER_DOCTOR_VIEW') },
        { path: '/attribution/rules', label: 'Rules', icon: GitMerge, show: hasPermission('MASTER_DOCTOR_VIEW') },
        { path: '/attribution/allocations', label: 'Allocations', icon: ListChecks, show: hasPermission('MASTER_DOCTOR_VIEW') },
        { path: '/attribution/results', label: 'Results', icon: ShoppingCart, show: hasPermission('MASTER_DOCTOR_VIEW') },
        { path: '/attribution/exceptions', label: 'Exceptions', icon: AlertTriangle, show: hasPermission('MASTER_DOCTOR_VIEW') },
      ],
    },
    {
      label: 'Email',
      items: [
        { path: '/email/INBOX', label: 'Inbox', icon: Inbox, show: hasPermission('EMAIL_ACCESS') },
        { path: '/email/Sent', label: 'Sent', icon: Send, show: hasPermission('EMAIL_ACCESS') },
        { path: '/email/drafts', label: 'Drafts', icon: FileEdit, show: hasPermission('EMAIL_ACCESS') },
        { path: '/email/Trash', label: 'Trash', icon: Trash2, show: hasPermission('EMAIL_ACCESS') },
      ],
    },
  ];

  const visibleNavGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="p-6 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Hontis HSAC</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            {visibleNavGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {groupIndex > 0 && <div className="border-t border-slate-700 my-3" />}
                <p className="px-4 pt-1 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 select-none">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                      (item.path.startsWith('/email/') && location.pathname.startsWith(item.path.split('/').slice(0, 3).join('/')));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="text-xs text-slate-400 space-y-1">
              <p>Logged in as</p>
              <p className="font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {user?.roles.map((r) => r.roleName).join(', ')}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

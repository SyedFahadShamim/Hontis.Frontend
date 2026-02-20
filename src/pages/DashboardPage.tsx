import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Key, Grid3x3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, hasPermission } = useAuth();

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Create, edit, and manage user accounts',
      icon: Users,
      link: '/users',
      show: hasPermission('USER_ADMIN'),
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Roles',
      description: 'Configure roles and their permissions',
      icon: Shield,
      link: '/roles',
      show: hasPermission('ROLE_ADMIN'),
      color: 'bg-green-500',
    },
    {
      title: 'View Permissions',
      description: 'Browse all available permissions',
      icon: Key,
      link: '/permissions',
      show: true,
      color: 'bg-orange-500',
    },
    {
      title: 'Role-Permission Matrix',
      description: 'Manage role-permission assignments',
      icon: Grid3x3,
      link: '/role-permission-matrix',
      show: hasPermission('ROLE_ADMIN'),
      color: 'bg-purple-500',
    },
  ];

  const visibleActions = quickActions.filter((action) => action.show);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what you can do in the Hontis HSAC Admin Portal
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-medium text-gray-900">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Roles</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {user?.roles.map((role) => (
                <span
                  key={role.roleId}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                >
                  {role.roleName}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permissions</p>
            <p className="font-medium text-gray-900">{user?.permissions.length} permissions</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

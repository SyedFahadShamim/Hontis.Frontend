import { useQuery } from '@tanstack/react-query';
import { Key } from 'lucide-react';
import { permissionsApi } from '../lib/api';

export const PermissionsPage = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(),
  });

  const modules = [...new Set(permissions?.map((p) => p.moduleName) || [])];

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'User Management': 'bg-blue-100 text-blue-700',
      'Role Management': 'bg-green-100 text-green-700',
      'Master Data': 'bg-orange-100 text-orange-700',
      Geography: 'bg-purple-100 text-purple-700',
      Rules: 'bg-pink-100 text-pink-700',
      'Data Import': 'bg-teal-100 text-teal-700',
    };
    return colors[module] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
        <p className="text-gray-600 mt-1">View all available permissions in the system</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const modulePermissions = permissions?.filter(
              (p) => p.moduleName === module
            );

            return (
              <div key={module} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{module}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {modulePermissions?.length}{' '}
                    {modulePermissions?.length === 1 ? 'permission' : 'permissions'}
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulePermissions?.map((permission) => (
                      <div
                        key={permission.permissionId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Key className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {permission.permissionName}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {permission.permissionCode}
                            </p>
                          </div>
                        </div>
                        {permission.description && (
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        )}
                        <div className="mt-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getModuleColor(
                              permission.moduleName
                            )}`}
                          >
                            {permission.moduleName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Check, X } from 'lucide-react';
import { rolesApi, permissionsApi } from '../lib/api';

export const RolePermissionMatrixPage = () => {
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(),
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(),
  });

  const { data: rolesWithPermissions } = useQuery({
    queryKey: ['rolesWithPermissions', roles],
    queryFn: async () => {
      if (!roles) return [];
      return Promise.all(
        roles.map((role) => rolesApi.getById(role.roleId))
      );
    },
    enabled: !!roles,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      await rolesApi.assignPermissions(roleId, { permissionIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolesWithPermissions'] });
      setChanges(new Map());
    },
  });

  const hasPermission = (roleId: number, permissionId: number): boolean => {
    const key = `${roleId}-${permissionId}`;
    if (changes.has(key)) {
      return changes.get(key)!;
    }
    const role = rolesWithPermissions?.find((r) => r.roleId === roleId);
    return role?.permissions.some((p) => p.permissionId === permissionId) || false;
  };

  const togglePermission = (roleId: number, permissionId: number) => {
    const key = `${roleId}-${permissionId}`;
    const currentValue = hasPermission(roleId, permissionId);
    setChanges(new Map(changes.set(key, !currentValue)));
  };

  const handleSave = async () => {
    const roleChanges = new Map<number, number[]>();

    changes.forEach((_, key) => {
      const [roleId] = key.split('-').map(Number);
      if (!roleChanges.has(roleId)) {
        roleChanges.set(roleId, []);
      }
    });

    for (const [roleId] of roleChanges) {
      const permissionIds: number[] = [];
      permissions?.forEach((permission) => {
        if (hasPermission(roleId, permission.permissionId)) {
          permissionIds.push(permission.permissionId);
        }
      });
      await updateMutation.mutateAsync({ roleId, permissionIds });
    }
  };

  const modules = [...new Set(permissions?.map((p) => p.moduleName) || [])];

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role-Permission Matrix</h1>
          <p className="text-gray-600 mt-1">Manage permission assignments for each role</p>
        </div>
        {changes.size > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{changes.size} unsaved changes</span>
            <button
              onClick={() => setChanges(new Map())}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
        {modules.map((module) => {
          const modulePermissions = permissions?.filter((p) => p.moduleName === module);
          if (!modulePermissions || modulePermissions.length === 0) return null;

          return (
            <div key={module} className="border-b border-gray-200 last:border-b-0">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{module}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        Permission
                      </th>
                      {roles?.map((role) => (
                        <th
                          key={role.roleId}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex flex-col items-center">
                            <span>{role.roleCode}</span>
                            <span className="text-xs text-gray-400 font-normal normal-case">
                              {role.roleName}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modulePermissions.map((permission) => (
                      <tr key={permission.permissionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 sticky left-0 bg-white">
                          <div>
                            <div className="font-medium">{permission.permissionName}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {permission.permissionCode}
                            </div>
                          </div>
                        </td>
                        {roles?.map((role) => {
                          const isChecked = hasPermission(role.roleId, permission.permissionId);
                          const key = `${role.roleId}-${permission.permissionId}`;
                          const hasChange = changes.has(key);

                          return (
                            <td
                              key={role.roleId}
                              className="px-4 py-4 text-center"
                            >
                              <button
                                onClick={() =>
                                  togglePermission(role.roleId, permission.permissionId)
                                }
                                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? hasChange
                                      ? 'bg-green-200 hover:bg-green-300'
                                      : 'bg-green-100 hover:bg-green-200'
                                    : hasChange
                                    ? 'bg-red-200 hover:bg-red-300'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {isChecked ? (
                                  <Check className="w-5 h-5 text-green-700" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

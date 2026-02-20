import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Pill } from 'lucide-react';
import { dosageFormsApi } from '../lib/api';
import type {
  DosageFormListResponse,
  CreateDosageFormRequest,
  UpdateDosageFormRequest,
} from '../types';

export const DosageFormsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingDosageForm, setEditingDosageForm] = useState<DosageFormListResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ['dosageForms', searchTerm, statusFilter, page, pageSize, sortBy, sortDir],
    queryFn: () =>
      dosageFormsApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        pageSize,
        sortBy: sortBy || undefined,
        sortDir,
      }),
  });

  const { data: dosageFormDetail } = useQuery({
    queryKey: ['dosageForm', editingDosageForm?.dosageFormId],
    queryFn: () => dosageFormsApi.getById(editingDosageForm!.dosageFormId),
    enabled: !!editingDosageForm,
  });

  const createMutation = useMutation({
    mutationFn: dosageFormsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dosageForms'] });
      setShowModal(false);
      alert('Dosage form created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create dosage form');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDosageFormRequest }) =>
      dosageFormsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dosageForms'] });
      setShowModal(false);
      setEditingDosageForm(null);
      alert('Dosage form updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update dosage form');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      dosageFormsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dosageForms'] });
      alert('Status updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dosageFormsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dosageForms'] });
      alert('Dosage form deleted successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete dosage form');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      dosageFormCode: (formData.get('dosageFormCode') as string).toUpperCase(),
      dosageFormName: formData.get('dosageFormName') as string,
      status: formData.get('status') as string,
    };

    if (editingDosageForm && dosageFormDetail) {
      updateMutation.mutate({ id: editingDosageForm.dosageFormId, data });
    } else {
      createMutation.mutate(data as CreateDosageFormRequest);
    }
  };

  const handleEdit = (dosageForm: DosageFormListResponse) => {
    setEditingDosageForm(dosageForm);
    setShowModal(true);
  };

  const handleToggleStatus = (dosageForm: DosageFormListResponse) => {
    const newStatus = dosageForm.status === 'Active' ? 'Inactive' : 'Active';
    if (confirm(`Are you sure you want to set this dosage form to ${newStatus}?`)) {
      updateStatusMutation.mutate({ id: dosageForm.dosageFormId, status: newStatus });
    }
  };

  const handleDelete = (dosageForm: DosageFormListResponse) => {
    if (confirm('Are you sure you want to delete this dosage form? It will be marked as Inactive.')) {
      deleteMutation.mutate(dosageForm.dosageFormId);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dosage Forms</h1>
          <p className="text-gray-600 mt-1">Manage dosage form master data</p>
        </div>
        <button
          onClick={() => {
            setEditingDosageForm(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Dosage Form</span>
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('dosageformcode')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Code {sortBy === 'dosageformcode' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('dosageformname')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Name {sortBy === 'dosageformname' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Status {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('updatedon')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Updated {sortBy === 'updatedon' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result?.items.map((dosageForm) => (
                    <tr key={dosageForm.dosageFormId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Pill className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {dosageForm.dosageFormCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dosageForm.dosageFormName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dosageForm.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {dosageForm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(dosageForm.updatedOn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(dosageForm)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(dosageForm)}
                          className={`${
                            dosageForm.status === 'Active'
                              ? 'text-yellow-600 hover:text-yellow-800'
                              : 'text-green-600 hover:text-green-800'
                          } inline-flex items-center`}
                        >
                          {dosageForm.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(dosageForm)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {result?.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No dosage forms found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {result && result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {(page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, result.totalCount)} of {result.totalCount} results
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {result.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === result.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingDosageForm ? 'Edit Dosage Form' : 'Create Dosage Form'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Form Code *
                </label>
                <input
                  type="text"
                  name="dosageFormCode"
                  defaultValue={dosageFormDetail?.dosageFormCode || ''}
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g., DF-SYR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Form Name *
                </label>
                <input
                  type="text"
                  name="dosageFormName"
                  defaultValue={dosageFormDetail?.dosageFormName || ''}
                  required
                  maxLength={150}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Syrup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  defaultValue={dosageFormDetail?.status || 'Active'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDosageForm(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingDosageForm
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

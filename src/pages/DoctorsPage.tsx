import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  ChevronUp,
  ChevronDown,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  Tag,
} from 'lucide-react';
import { doctorsApi } from '../lib/doctors-api';
import { DoctorFormModal } from '../components/DoctorFormModal';
import { DoctorStatusModal } from '../components/DoctorStatusModal';
import { useAuth } from '../contexts/AuthContext';
import type { DoctorListResponse } from '../types';

const DOCTOR_STATUS_COLORS: Record<string, string> = {
  'DS-PROSPECT': 'bg-blue-100 text-blue-800',
  'DS-ACTIVE': 'bg-green-100 text-green-800',
  'DS-INACTIVE': 'bg-gray-100 text-gray-800',
  'DS-BLOCKED': 'bg-red-100 text-red-800',
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const DoctorsPage = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('MASTER_DOCTOR_EDIT');

  const [searchTerm, setSearchTerm] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);
  const [statusModalDoctor, setStatusModalDoctor] = useState<DoctorListResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: [
      'doctors',
      searchTerm,
      specialityFilter,
      doctorStatusFilter,
      cityFilter,
      statusFilter,
      page,
      pageSize,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      doctorsApi.getAll({
        search: searchTerm || undefined,
        specialityCode: specialityFilter || undefined,
        doctorStatusCode: doctorStatusFilter || undefined,
        cityCode: cityFilter || undefined,
        status: statusFilter || undefined,
        page,
        pageSize,
        sortBy: sortBy || undefined,
        sortDir,
      }),
  });

  const { data: specialities = [] } = useQuery({
    queryKey: ['lookupSpecialities'],
    queryFn: doctorsApi.getSpecialities,
  });

  const { data: doctorStatuses = [] } = useQuery({
    queryKey: ['lookupDoctorStatuses'],
    queryFn: doctorsApi.getDoctorStatuses,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['lookupGeoCities', ''],
    queryFn: () => doctorsApi.getGeoCities(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      doctorsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update status');
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  const handleStatusModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const sortableHeader = (label: string, column: string) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <SortIcon column={column} />
    </button>
  );

  const doctors = result?.items ?? [];
  const totalCount = result?.totalCount ?? 0;
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Doctors</h1>
            <p className="text-sm text-gray-500">
              {totalCount} doctor{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingDoctorId(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by code or name..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={specialityFilter}
              onChange={handleFilterChange(setSpecialityFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialities</option>
              {specialities.map((s) => (
                <option key={s.specialityCode} value={s.specialityCode}>
                  {s.specialityName}
                </option>
              ))}
            </select>
            <select
              value={doctorStatusFilter}
              onChange={handleFilterChange(setDoctorStatusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Doctor Statuses</option>
              {doctorStatuses.map((s) => (
                <option key={s.doctorStatusCode} value={s.doctorStatusCode}>
                  {s.doctorStatusName}
                </option>
              ))}
            </select>
            <select
              value={cityFilter}
              onChange={handleFilterChange(setCityFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c.cityCode} value={c.cityCode}>
                  {c.cityName}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {sortableHeader('Code', 'doctorcode')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {sortableHeader('Name', 'doctorname')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {sortableHeader('Speciality', 'speciality')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {sortableHeader('Doctor Status', 'doctorstatus')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Primary City
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {sortableHeader('Updated', 'updatedon')}
                </th>
                {canEdit && (
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading doctors...
                    </div>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No doctors found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor.doctorId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {doctor.doctorCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{doctor.doctorName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {doctor.specialityName ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      {doctor.doctorStatusCode ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            DOCTOR_STATUS_COLORS[doctor.doctorStatusCode] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {doctor.doctorStatusName ?? doctor.doctorStatusCode}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doctor.primaryCityName ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doctor.phone ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctor.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(doctor.updatedOn)}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingDoctorId(doctor.doctorId);
                              setShowFormModal(true);
                            }}
                            title="Edit doctor"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: doctor.doctorId,
                                status: doctor.status === 'Active' ? 'Inactive' : 'Active',
                              })
                            }
                            title={
                              doctor.status === 'Active' ? 'Deactivate doctor' : 'Activate doctor'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              doctor.status === 'Active'
                                ? 'text-green-600 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {doctor.status === 'Active' ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setStatusModalDoctor(doctor)}
                            title="Change doctor status"
                            className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && doctors.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalCount)} of {totalCount}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showFormModal && (
        <DoctorFormModal
          doctorId={editingDoctorId}
          onClose={() => {
            setShowFormModal(false);
            setEditingDoctorId(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {statusModalDoctor && (
        <DoctorStatusModal
          doctor={statusModalDoctor}
          onClose={() => setStatusModalDoctor(null)}
          onSuccess={handleStatusModalSuccess}
        />
      )}
    </div>
  );
};

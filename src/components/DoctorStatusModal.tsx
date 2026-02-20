import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { doctorsApi } from '../lib/doctors-api';
import type { DoctorListResponse } from '../types';

interface DoctorStatusModalProps {
  doctor: DoctorListResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const WARNING_STATUSES = ['DS-INACTIVE', 'DS-BLOCKED'];

export const DoctorStatusModal = ({ doctor, onClose, onSuccess }: DoctorStatusModalProps) => {
  const [selectedCode, setSelectedCode] = useState(doctor.doctorStatusCode);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: doctorStatuses = [] } = useQuery({
    queryKey: ['lookupDoctorStatuses'],
    queryFn: doctorsApi.getDoctorStatuses,
  });

  const mutation = useMutation({
    mutationFn: (code: string) => doctorsApi.updateDoctorStatusCode(doctor.doctorId, code),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.message || 'Failed to update doctor status');
    },
  });

  const showWarning = WARNING_STATUSES.includes(selectedCode) && selectedCode !== doctor.doctorStatusCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    mutation.mutate(selectedCode);
  };

  const selectedStatus = doctorStatuses.find((s) => s.doctorStatusCode === selectedCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Change Doctor Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{doctor.doctorName}</span>
              <span className="text-gray-400 ml-1">({doctor.doctorCode})</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                value={selectedCode}
                onChange={(e) => {
                  setSelectedCode(e.target.value);
                  setServerError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {doctorStatuses.map((s) => (
                  <option key={s.doctorStatusCode} value={s.doctorStatusCode}>
                    {s.doctorStatusName}
                  </option>
                ))}
              </select>
            </div>

            {showWarning && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  You are about to set this doctor to{' '}
                  <strong>{selectedStatus?.doctorStatusName}</strong>. This may affect their
                  visibility and eligibility in allocation workflows. Please confirm this action.
                </p>
              </div>
            )}

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || selectedCode === doctor.doctorStatusCode}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

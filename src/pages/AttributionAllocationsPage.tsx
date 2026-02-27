import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users2, Plus, Save, Trash2 } from 'lucide-react';
import { attributionApi } from '../lib/attribution-api';
import { doctorsApi } from '../lib/doctors-api';
import { useAuth } from '../contexts/AuthContext';

export const AttributionAllocationsPage = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('MASTER_DOCTOR_EDIT');
  const [ruleId, setRuleId] = useState<number | null>(null);
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [allocationPercent, setAllocationPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: rulesResult } = useQuery({
    queryKey: ['allocationRulesLookup'],
    queryFn: () => attributionApi.getRules({ page: 1, pageSize: 100 }),
  });

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ['allocationsByRule', ruleId],
    queryFn: () => attributionApi.getAllocations(ruleId as number),
    enabled: ruleId !== null,
  });

  const { data: ruleDetail } = useQuery({
    queryKey: ['allocationRuleDetail', ruleId],
    queryFn: () => attributionApi.getRuleById(ruleId as number),
    enabled: ruleId !== null,
  });

  const { data: doctorsResult } = useQuery({
    queryKey: ['allocationDoctorsLookup'],
    queryFn: () => doctorsApi.getAll({ page: 1, pageSize: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: number; payload: { doctorId: number; allocationPercent: number; notes?: string } }) =>
      attributionApi.createAllocation(ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocationsByRule', ruleId] });
      setSelectedAllocationId(null);
      setDoctorId('');
      setAllocationPercent(0);
      setNotes('');
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to create allocation.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ allocationId, payload }: { allocationId: number; payload: { allocationPercent: number; notes?: string } }) =>
      attributionApi.updateAllocation(allocationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocationsByRule', ruleId] });
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to update allocation.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: attributionApi.deleteAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocationsByRule', ruleId] });
      setSelectedAllocationId(null);
      setDoctorId('');
      setAllocationPercent(0);
      setNotes('');
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to delete allocation.');
    },
  });

  useEffect(() => {
    if (!ruleId) {
      setSelectedAllocationId(null);
      setDoctorId('');
      setAllocationPercent(0);
      setNotes('');
      setFormError(null);
    }
  }, [ruleId]);

  useEffect(() => {
    const allocation = allocations.find((item) => item.allocationId === selectedAllocationId);
    if (!allocation) return;
    setDoctorId(allocation.doctorId);
    setAllocationPercent(allocation.allocationPercent);
    setNotes(allocation.notes ?? '');
  }, [selectedAllocationId, allocations]);

  const handleSave = () => {
    if (!ruleId) {
      setFormError('Select a rule before saving allocations.');
      return;
    }
    if (!doctorId) {
      setFormError('Select a doctor.');
      return;
    }
    if (ruleDetail?.allocationTypeCode === 'AT-PCT' && allocationPercent <= 0) {
      setFormError('Allocation percent must be greater than 0.');
      return;
    }

    if (selectedAllocationId) {
      updateMutation.mutate({
        allocationId: selectedAllocationId,
        payload: {
          allocationPercent: ruleDetail?.allocationTypeCode === 'AT-PCT' ? allocationPercent : null,
          notes: notes || undefined,
        },
      });
    } else {
      createMutation.mutate({
        ruleId,
        payload: {
          doctorId: Number(doctorId),
          allocationPercent: ruleDetail?.allocationTypeCode === 'AT-PCT' ? allocationPercent : null,
          notes: notes || undefined,
        },
      });
    }
  };

  const handleNew = () => {
    if (!ruleId) {
      setFormError('Select a rule before adding allocations.');
      return;
    }
    setSelectedAllocationId(null);
    setDoctorId('');
    setAllocationPercent(0);
    setNotes('');
    setFormError(null);
  };

  const doctors = doctorsResult?.items ?? [];
  const usedDoctorIds = useMemo(
    () => new Set(allocations.map((allocation) => allocation.doctorId)),
    [allocations]
  );
  const availableDoctors = doctors.filter(
    (doctor) => !usedDoctorIds.has(doctor.doctorId) || doctor.doctorId === doctorId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Users2 className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rule Allocations</h1>
          <p className="text-sm text-gray-500">Doctor splits attached to attribution rules</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={ruleId ?? ''}
            onChange={(e) => setRuleId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
          >
            <option value="">Select rule...</option>
            {(rulesResult?.items ?? []).map((rule) => (
              <option key={rule.ruleId} value={rule.ruleId}>
                {rule.ruleCode} - {rule.ruleName}
              </option>
            ))}
          </select>
          {canEdit && (
            <button
              onClick={handleNew}
              disabled={!ruleId}
              title={!ruleId ? 'Select a rule first' : 'Add a new allocation'}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              New Allocation
            </button>
          )}
        </div>

        {ruleDetail && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <span>
                <span className="text-gray-500">Rule:</span> {ruleDetail.ruleCode} — {ruleDetail.ruleName}
              </span>
              <span>
                <span className="text-gray-500">Level:</span> {ruleDetail.ruleLevelCode}
              </span>
              <span>
                <span className="text-gray-500">Target:</span>{' '}
                {ruleDetail.dcCode || ruleDetail.customerCode
                  ? `${ruleDetail.dcCode ?? '-'} / ${ruleDetail.customerCode ?? '-'}`
                  : ruleDetail.brickCode || ruleDetail.cityCode || ruleDetail.regionCode || '-'}
              </span>
              <span>
                <span className="text-gray-500">Allocation:</span> {ruleDetail.allocationTypeCode}
              </span>
              {ruleDetail.allocationTypeCode === 'AT-PCT' && (
                <span>
                  <span className="text-gray-500">Percent Policy:</span> {ruleDetail.percentPolicyCode ?? '-'}
                </span>
              )}
              <span>
                <span className="text-gray-500">Product:</span>{' '}
                {ruleDetail.appliesToAllProducts ? 'All Products' : ruleDetail.hontisProductCode ?? '-'}
              </span>
            </div>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
            {formError}
          </div>
        )}

        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1 text-xs">
              <span className="text-gray-500">Doctor *</span>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                disabled={!ruleId}
              >
                <option value="">Select doctor</option>
                {availableDoctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.doctorName} ({doctor.doctorCode})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-gray-500">Allocation % *</span>
              <input
                type="number"
                value={allocationPercent}
                onChange={(e) => setAllocationPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                disabled={!ruleId || ruleDetail?.allocationTypeCode !== 'AT-PCT'}
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-gray-500">Notes</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                disabled={!ruleId}
              />
            </label>
            <div className="flex items-center gap-2 md:col-span-3">
              <button
                onClick={handleSave}
                disabled={!ruleId || createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {selectedAllocationId ? 'Save Changes' : 'Add Allocation'}
              </button>
              {selectedAllocationId && (
                <button
                  onClick={() => deleteMutation.mutate(selectedAllocationId)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Doctor
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Allocation %
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!ruleId ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Select a rule to view allocations.
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Loading allocations...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    No allocations found.
                  </td>
                </tr>
              ) : (
                allocations.map((allocation) => (
                  <tr
                    key={allocation.allocationId}
                    onClick={() => setSelectedAllocationId(allocation.allocationId)}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedAllocationId === allocation.allocationId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {allocation.doctorName ?? `Doctor ${allocation.doctorId}`}
                      <span className="text-xs text-gray-500 ml-2">
                        {allocation.doctorCode ? `(${allocation.doctorCode})` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {allocation.allocationPercent ?? '-'}
                      {allocation.allocationPercent !== null && allocation.allocationPercent !== undefined ? '%' : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{allocation.notes ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Search, ChevronDown, Plus, Save, Trash2 } from 'lucide-react';
import { attributionApi } from '../lib/attribution-api';
import type { AttributionRuleListResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doctorsApi } from '../lib/doctors-api';
import { productsApi } from '../lib/products-api';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const buildTargetLabel = (rule: AttributionRuleListResponse) => {
  if (rule.dcCode || rule.customerCode) return `Store: ${rule.dcCode ?? '-'} / ${rule.customerCode ?? '-'}`;
  if (rule.brickCode) return `Brick: ${rule.brickCode}`;
  if (rule.cityCode) return `City: ${rule.cityCode}`;
  if (rule.regionCode) return `Region: ${rule.regionCode}`;
  return '-';
};

const formatDateInput = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyRuleForm = {
  ruleCode: '',
  ruleName: '',
  ruleLevelCode: '',
  allocationTypeCode: '',
  ruleStatusCode: '',
  dcCode: '',
  customerCode: '',
  brickCode: '',
  cityCode: '',
  regionCode: '',
  appliesToAllProducts: true,
  hontisProductCode: '',
  percentPolicyCode: '',
  effectiveFrom: '',
  effectiveTo: '',
  priority: 100,
  approvedBy: '',
  approvedOn: '',
  notes: '',
};

export const AttributionRulesPage = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('MASTER_DOCTOR_EDIT');
  const [search, setSearch] = useState('');
  const [ruleLevelCode, setRuleLevelCode] = useState('');
  const [allocationTypeCode, setAllocationTypeCode] = useState('');
  const [ruleStatusCode, setRuleStatusCode] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [formState, setFormState] = useState({ ...emptyRuleForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: rulesResult, isLoading } = useQuery({
    queryKey: ['attributionRules', search, ruleLevelCode, allocationTypeCode, ruleStatusCode, page, pageSize],
    queryFn: () =>
      attributionApi.getRules({
        search: search || undefined,
        ruleLevelCode: ruleLevelCode || undefined,
        allocationTypeCode: allocationTypeCode || undefined,
        ruleStatusCode: ruleStatusCode || undefined,
        page,
        pageSize,
        sortBy: 'updatedOn',
        sortDir: 'desc',
      }),
  });

  const { data: ruleDetail } = useQuery({
    queryKey: ['attributionRuleDetail', selectedRuleId],
    queryFn: () => attributionApi.getRuleById(selectedRuleId as number),
    enabled: selectedRuleId !== null,
  });

  const { data: ruleLevels = [] } = useQuery({
    queryKey: ['ruleLevels'],
    queryFn: attributionApi.getRuleLevels,
  });

  const { data: allocationTypes = [] } = useQuery({
    queryKey: ['allocationTypes'],
    queryFn: attributionApi.getAllocationTypes,
  });

  const { data: ruleStatuses = [] } = useQuery({
    queryKey: ['ruleStatuses'],
    queryFn: attributionApi.getRuleStatuses,
  });

  const { data: geoRegions = [] } = useQuery({
    queryKey: ['geoRegionsLookup'],
    queryFn: doctorsApi.getGeoRegions,
  });

  const { data: geoCities = [] } = useQuery({
    queryKey: ['geoCitiesLookup'],
    queryFn: () => doctorsApi.getGeoCities(),
  });

  const { data: geoBricks = [] } = useQuery({
    queryKey: ['geoBricksLookup'],
    queryFn: () => doctorsApi.getGeoBricks(),
  });

  const { data: productsResult } = useQuery({
    queryKey: ['attributionProductsLookup'],
    queryFn: () => productsApi.getAll({ page: 1, pageSize: 200 }),
  });

  const createRuleMutation = useMutation({
    mutationFn: attributionApi.createRule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attributionRules'] });
      queryClient.invalidateQueries({ queryKey: ['attributionRuleDetail'] });
      setSelectedRuleId(data.ruleId);
      setFormError(null);
      setEditMode(false);
      setShowNewRuleModal(false);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to create rule.');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: typeof formState }) =>
      attributionApi.updateRule(id, {
        ruleCode: payload.ruleCode,
        ruleName: payload.ruleName,
        ruleLevelCode: payload.ruleLevelCode,
        allocationTypeCode: payload.allocationTypeCode,
        ruleStatusCode: payload.ruleStatusCode,
        dcCode: payload.dcCode || null,
        customerCode: payload.customerCode || null,
        brickCode: payload.brickCode || null,
        cityCode: payload.cityCode || null,
        regionCode: payload.regionCode || null,
        appliesToAllProducts: payload.appliesToAllProducts,
        hontisProductCode: payload.appliesToAllProducts ? null : payload.hontisProductCode || null,
        percentPolicyCode: payload.percentPolicyCode || null,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo || null,
        priority: payload.priority,
        approvedBy: payload.approvedBy || null,
        approvedOn: payload.approvedOn || null,
        notes: payload.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributionRules'] });
      queryClient.invalidateQueries({ queryKey: ['attributionRuleDetail', selectedRuleId] });
      setFormError(null);
      setEditMode(false);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to update rule.');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: attributionApi.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributionRules'] });
      setSelectedRuleId(null);
      setFormState({ ...emptyRuleForm });
      setEditMode(false);
      setShowNewRuleModal(false);
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to delete rule.');
    },
  });

  const isStoreLevel = formState.ruleLevelCode === 'RL-STORE';
  const isBrickLevel = formState.ruleLevelCode === 'RL-BRICK';
  const isCityLevel = formState.ruleLevelCode === 'RL-CITY';
  const isRegionLevel = formState.ruleLevelCode === 'RL-REGION';
  const isPercentAllocation = formState.allocationTypeCode === 'AT-PCT';

  const isFormValid = useMemo(() => {
    if (!formState.ruleCode.trim()) return false;
    if (!formState.ruleName.trim()) return false;
    if (!formState.ruleLevelCode) return false;
    if (!formState.allocationTypeCode) return false;
    if (!formState.ruleStatusCode) return false;
    if (!formState.effectiveFrom) return false;
    if (!formState.appliesToAllProducts && !formState.hontisProductCode.trim()) return false;
    if (isPercentAllocation && !formState.percentPolicyCode.trim()) return false;
    if (isStoreLevel && (!formState.dcCode.trim() || !formState.customerCode.trim())) return false;
    if (isBrickLevel && !formState.brickCode.trim()) return false;
    if (isCityLevel && !formState.cityCode.trim()) return false;
    if (isRegionLevel && !formState.regionCode.trim()) return false;
    return true;
  }, [formState, isStoreLevel, isBrickLevel, isCityLevel, isRegionLevel, isPercentAllocation]);

  const handleSelectRule = (rule: AttributionRuleListResponse) => {
    setSelectedRuleId(rule.ruleId);
    setFormError(null);
    setEditMode(false);
  };

  const handleNewRule = () => {
    setSelectedRuleId(null);
    setFormState({ ...emptyRuleForm });
    setFormError(null);
    setEditMode(true);
    setShowNewRuleModal(true);
  };

  const handleEditRule = () => {
    if (!selectedRuleId) return;
    setEditMode(true);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      setFormError('Please fill all required fields before saving.');
      return;
    }

    if (selectedRuleId) {
      updateRuleMutation.mutate({ id: selectedRuleId, payload: formState });
    } else {
      createRuleMutation.mutate({
        ruleCode: formState.ruleCode,
        ruleName: formState.ruleName,
        ruleLevelCode: formState.ruleLevelCode,
        allocationTypeCode: formState.allocationTypeCode,
        ruleStatusCode: formState.ruleStatusCode,
        dcCode: formState.dcCode || null,
        customerCode: formState.customerCode || null,
        brickCode: formState.brickCode || null,
        cityCode: formState.cityCode || null,
        regionCode: formState.regionCode || null,
        appliesToAllProducts: formState.appliesToAllProducts,
        hontisProductCode: formState.appliesToAllProducts ? null : formState.hontisProductCode || null,
        percentPolicyCode: formState.percentPolicyCode || null,
        effectiveFrom: formState.effectiveFrom,
        effectiveTo: formState.effectiveTo || null,
        priority: formState.priority,
        approvedBy: formState.approvedBy || null,
        approvedOn: formState.approvedOn || null,
        notes: formState.notes || null,
      });
    }
  };

  const rules = rulesResult?.items ?? [];
  const totalCount = rulesResult?.totalCount ?? 0;
  const totalPages = rulesResult?.totalPages ?? 1;

  useEffect(() => {
    if (!ruleDetail || !selectedRuleId) return;
    setFormState({
      ruleCode: ruleDetail.ruleCode,
      ruleName: ruleDetail.ruleName,
      ruleLevelCode: ruleDetail.ruleLevelCode,
      allocationTypeCode: ruleDetail.allocationTypeCode,
      ruleStatusCode: ruleDetail.ruleStatusCode,
      dcCode: ruleDetail.dcCode ?? '',
      customerCode: ruleDetail.customerCode ?? '',
      brickCode: ruleDetail.brickCode ?? '',
      cityCode: ruleDetail.cityCode ?? '',
      regionCode: ruleDetail.regionCode ?? '',
      appliesToAllProducts: ruleDetail.appliesToAllProducts,
      hontisProductCode: ruleDetail.hontisProductCode ?? '',
      percentPolicyCode: ruleDetail.percentPolicyCode ?? '',
      effectiveFrom: formatDateInput(ruleDetail.effectiveFrom),
      effectiveTo: formatDateInput(ruleDetail.effectiveTo),
      priority: ruleDetail.priority,
      approvedBy: ruleDetail.approvedBy ?? '',
      approvedOn: formatDateInput(ruleDetail.approvedOn),
      notes: ruleDetail.notes ?? '',
    });
  }, [ruleDetail, selectedRuleId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attribution Rules</h1>
          <p className="text-sm text-gray-500">{totalCount} rule{totalCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by rule code or name..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={ruleLevelCode}
                onChange={(e) => {
                  setRuleLevelCode(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {ruleLevels.map((level) => (
                  <option key={level.ruleLevelCode} value={level.ruleLevelCode}>
                    {level.ruleLevelName}
                  </option>
                ))}
              </select>
              <select
                value={allocationTypeCode}
                onChange={(e) => {
                  setAllocationTypeCode(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Allocation Types</option>
                {allocationTypes.map((type) => (
                  <option key={type.allocationTypeCode} value={type.allocationTypeCode}>
                    {type.allocationTypeName}
                  </option>
                ))}
              </select>
              <select
                value={ruleStatusCode}
                onChange={(e) => {
                  setRuleStatusCode(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {ruleStatuses.map((status) => (
                  <option key={status.ruleStatusCode} value={status.ruleStatusCode}>
                    {status.ruleStatusName}
                  </option>
                ))}
              </select>
              {canEdit && (
                <button
                  onClick={handleNewRule}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Rule
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Rule
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Level
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Target
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Effective
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      Loading rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      No attribution rules found.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr
                      key={rule.ruleId}
                      onClick={() => handleSelectRule(rule)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRuleId === rule.ruleId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">{rule.ruleCode}</div>
                        <div className="text-xs text-gray-500">{rule.ruleName}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{rule.ruleLevelCode}</td>
                      <td className="px-4 py-3 text-gray-600">{buildTargetLabel(rule)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {rule.appliesToAllProducts ? 'All Products' : rule.hontisProductCode ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {rule.ruleStatusCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(rule.effectiveFrom)} → {formatDate(rule.effectiveTo)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 font-medium">{rule.priority}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && rules.length > 0 && (
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

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Rule Detail</h2>
            <div className="flex items-center gap-2">
              {canEdit && selectedRuleId && !editMode && (
                <button
                  onClick={handleEditRule}
                  className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  Edit
                </button>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {editMode && selectedRuleId ? (
            <div className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-gray-500">Rule Code *</span>
                  <input
                    value={formState.ruleCode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, ruleCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Rule Name *</span>
                  <input
                    value={formState.ruleName}
                    onChange={(e) => setFormState((prev) => ({ ...prev, ruleName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Rule Level *</span>
                  <select
                    value={formState.ruleLevelCode}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        ruleLevelCode: e.target.value,
                        dcCode: '',
                        customerCode: '',
                        brickCode: '',
                        cityCode: '',
                        regionCode: '',
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select level</option>
                    {ruleLevels.map((level) => (
                      <option key={level.ruleLevelCode} value={level.ruleLevelCode}>
                        {level.ruleLevelName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Allocation Type *</span>
                  <select
                    value={formState.allocationTypeCode}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        allocationTypeCode: e.target.value,
                        percentPolicyCode: e.target.value === 'AT-PCT' ? prev.percentPolicyCode : '',
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select type</option>
                    {allocationTypes.map((type) => (
                      <option key={type.allocationTypeCode} value={type.allocationTypeCode}>
                        {type.allocationTypeName}
                      </option>
                    ))}
                  </select>
                </label>
                {isPercentAllocation && (
                  <label className="space-y-1">
                    <span className="text-gray-500">Percent Policy *</span>
                    <select
                      value={formState.percentPolicyCode}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, percentPolicyCode: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select policy</option>
                      <option value="MUST_EQUAL_100">Must Equal 100</option>
                      <option value="ALLOW_LESS_THAN_100">Allow &lt; 100</option>
                    </select>
                  </label>
                )}
                <label className="space-y-1">
                  <span className="text-gray-500">Rule Status *</span>
                  <select
                    value={formState.ruleStatusCode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, ruleStatusCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select status</option>
                    {ruleStatuses.map((status) => (
                      <option key={status.ruleStatusCode} value={status.ruleStatusCode}>
                        {status.ruleStatusName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Priority *</span>
                  <input
                    type="number"
                    value={formState.priority}
                    onChange={(e) => setFormState((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
              </div>

              {isStoreLevel && (
                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Target Code (Pharmacy) *</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={formState.dcCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, dcCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="DC Code"
                      disabled={!canEdit}
                    />
                    <input
                      value={formState.customerCode}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, customerCode: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="Customer Code"
                      disabled={!canEdit}
                    />
                  </div>
                </label>
              )}
              {isBrickLevel && (
                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Target Code (Brick) *</span>
                  <select
                    value={formState.brickCode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, brickCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select brick</option>
                    {geoBricks.map((brick) => (
                      <option key={brick.brickCode} value={brick.brickCode}>
                        {brick.brickName} ({brick.brickCode})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {isCityLevel && (
                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Target Code (City) *</span>
                  <select
                    value={formState.cityCode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, cityCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select city</option>
                    {geoCities.map((city) => (
                      <option key={city.cityCode} value={city.cityCode}>
                        {city.cityName} ({city.cityCode})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {isRegionLevel && (
                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Target Code (Region) *</span>
                  <select
                    value={formState.regionCode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, regionCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select region</option>
                    {geoRegions.map((region) => (
                      <option key={region.regionCode} value={region.regionCode}>
                        {region.regionName} ({region.regionCode})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={formState.appliesToAllProducts}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, appliesToAllProducts: e.target.checked }))
                  }
                  disabled={!canEdit}
                />
                <span className="text-gray-600">Applies to all products</span>
              </div>
              {!formState.appliesToAllProducts && (
                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Hontis Product Code *</span>
                  <select
                    value={formState.hontisProductCode}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, hontisProductCode: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  >
                    <option value="">Select product</option>
                    {productsResult?.items?.map((product) => (
                      <option key={product.hontisProductCode} value={product.hontisProductCode}>
                        {product.productName} ({product.hontisProductCode})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-gray-500">Effective From *</span>
                  <input
                    type="date"
                    value={formState.effectiveFrom}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, effectiveFrom: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Effective To</span>
                  <input
                    type="date"
                    value={formState.effectiveTo}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, effectiveTo: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Approved By</span>
                  <input
                    value={formState.approvedBy}
                    onChange={(e) => setFormState((prev) => ({ ...prev, approvedBy: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-gray-500">Approved On</span>
                  <input
                    type="date"
                    value={formState.approvedOn}
                    onChange={(e) => setFormState((prev) => ({ ...prev, approvedOn: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    disabled={!canEdit}
                  />
                </label>
              </div>

              <label className="space-y-1 text-xs block">
                <span className="text-gray-500">Notes</span>
                <textarea
                  value={formState.notes}
                  onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  rows={3}
                  disabled={!canEdit}
                />
              </label>

              {canEdit && editMode && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={!isFormValid || createRuleMutation.isPending || updateRuleMutation.isPending}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {selectedRuleId ? 'Save Changes' : 'Create Rule'}
                  </button>
                  {selectedRuleId && (
                    <button
                      onClick={() => deleteRuleMutation.mutate(selectedRuleId)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : selectedRuleId ? (
            !ruleDetail ? (
              <p className="text-sm text-gray-500">Loading rule detail...</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Rule</p>
                  <p className="font-semibold text-gray-900">{ruleDetail.ruleCode}</p>
                  <p className="text-xs text-gray-500">{ruleDetail.ruleName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500">Level</p>
                    <p className="text-gray-800 font-medium">{ruleDetail.ruleLevelCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Allocation</p>
                    <p className="text-gray-800 font-medium">{ruleDetail.allocationTypeCode}</p>
                  </div>
                  {ruleDetail.allocationTypeCode === 'AT-PCT' && (
                    <div>
                      <p className="text-gray-500">Percent Policy</p>
                      <p className="text-gray-800 font-medium">
                        {ruleDetail.percentPolicyCode ?? '-'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="text-gray-800 font-medium">{ruleDetail.ruleStatusCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Priority</p>
                    <p className="text-gray-800 font-medium">{ruleDetail.priority}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="text-sm text-gray-800">{buildTargetLabel(ruleDetail)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Product Scope</p>
                  <p className="text-sm text-gray-800">
                    {ruleDetail.appliesToAllProducts ? 'All Products' : ruleDetail.hontisProductCode ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Allocations</p>
                  {ruleDetail.allocations.length === 0 ? (
                    <p className="text-sm text-gray-500">No allocations yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {ruleDetail.allocations.map((allocation) => (
                        <li key={allocation.allocationId} className="text-sm text-gray-700 flex justify-between">
                          <span>{allocation.doctorName ?? allocation.doctorCode ?? `Doctor ${allocation.doctorId}`}</span>
                          <span className="font-medium">{allocation.allocationPercent}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          ) : (
            <p className="text-sm text-gray-500">
              Select a rule to view details, or click “New Rule” to create one.
            </p>
          )}
        </div>
      </div>

      {showNewRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Rule</h2>
              <button
                onClick={() => {
                  setShowNewRuleModal(false);
                  setEditMode(false);
                  setFormState({ ...emptyRuleForm });
                  setFormError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-gray-500">Rule Code *</span>
                    <input
                      value={formState.ruleCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, ruleCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Rule Name *</span>
                    <input
                      value={formState.ruleName}
                      onChange={(e) => setFormState((prev) => ({ ...prev, ruleName: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Rule Level *</span>
                    <select
                      value={formState.ruleLevelCode}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          ruleLevelCode: e.target.value,
                          dcCode: '',
                          customerCode: '',
                          brickCode: '',
                          cityCode: '',
                          regionCode: '',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select level</option>
                      {ruleLevels.map((level) => (
                        <option key={level.ruleLevelCode} value={level.ruleLevelCode}>
                          {level.ruleLevelName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Allocation Type *</span>
                    <select
                      value={formState.allocationTypeCode}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          allocationTypeCode: e.target.value,
                          percentPolicyCode: e.target.value === 'AT-PCT' ? prev.percentPolicyCode : '',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select type</option>
                      {allocationTypes.map((type) => (
                        <option key={type.allocationTypeCode} value={type.allocationTypeCode}>
                          {type.allocationTypeName}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isPercentAllocation && (
                    <label className="space-y-1">
                      <span className="text-gray-500">Percent Policy *</span>
                      <select
                        value={formState.percentPolicyCode}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, percentPolicyCode: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        disabled={!canEdit}
                      >
                        <option value="">Select policy</option>
                        <option value="MUST_EQUAL_100">Must Equal 100</option>
                        <option value="ALLOW_LESS_THAN_100">Allow &lt; 100</option>
                      </select>
                    </label>
                  )}
                  <label className="space-y-1">
                    <span className="text-gray-500">Rule Status *</span>
                    <select
                      value={formState.ruleStatusCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, ruleStatusCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select status</option>
                      {ruleStatuses.map((status) => (
                        <option key={status.ruleStatusCode} value={status.ruleStatusCode}>
                          {status.ruleStatusName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Priority *</span>
                    <input
                      type="number"
                      value={formState.priority}
                      onChange={(e) => setFormState((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                </div>

                {isStoreLevel && (
                  <label className="space-y-1 text-xs block">
                    <span className="text-gray-500">Target Code (Pharmacy) *</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={formState.dcCode}
                        onChange={(e) => setFormState((prev) => ({ ...prev, dcCode: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="DC Code"
                        disabled={!canEdit}
                      />
                      <input
                        value={formState.customerCode}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, customerCode: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="Customer Code"
                        disabled={!canEdit}
                      />
                    </div>
                  </label>
                )}
                {isBrickLevel && (
                  <label className="space-y-1 text-xs block">
                    <span className="text-gray-500">Target Code (Brick) *</span>
                    <select
                      value={formState.brickCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, brickCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select brick</option>
                      {geoBricks.map((brick) => (
                        <option key={brick.brickCode} value={brick.brickCode}>
                          {brick.brickName} ({brick.brickCode})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {isCityLevel && (
                  <label className="space-y-1 text-xs block">
                    <span className="text-gray-500">Target Code (City) *</span>
                    <select
                      value={formState.cityCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, cityCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select city</option>
                      {geoCities.map((city) => (
                        <option key={city.cityCode} value={city.cityCode}>
                          {city.cityName} ({city.cityCode})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {isRegionLevel && (
                  <label className="space-y-1 text-xs block">
                    <span className="text-gray-500">Target Code (Region) *</span>
                    <select
                      value={formState.regionCode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, regionCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select region</option>
                      {geoRegions.map((region) => (
                        <option key={region.regionCode} value={region.regionCode}>
                          {region.regionName} ({region.regionCode})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={formState.appliesToAllProducts}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, appliesToAllProducts: e.target.checked }))
                    }
                    disabled={!canEdit}
                  />
                  <span className="text-gray-600">Applies to all products</span>
                </div>
                {!formState.appliesToAllProducts && (
                  <label className="space-y-1 text-xs block">
                    <span className="text-gray-500">Hontis Product Code *</span>
                    <select
                      value={formState.hontisProductCode}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, hontisProductCode: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    >
                      <option value="">Select product</option>
                      {productsResult?.items?.map((product) => (
                        <option key={product.hontisProductCode} value={product.hontisProductCode}>
                          {product.productName} ({product.hontisProductCode})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-gray-500">Effective From *</span>
                    <input
                      type="date"
                      value={formState.effectiveFrom}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, effectiveFrom: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Effective To</span>
                    <input
                      type="date"
                      value={formState.effectiveTo}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, effectiveTo: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Approved By</span>
                    <input
                      value={formState.approvedBy}
                      onChange={(e) => setFormState((prev) => ({ ...prev, approvedBy: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-gray-500">Approved On</span>
                    <input
                      type="date"
                      value={formState.approvedOn}
                      onChange={(e) => setFormState((prev) => ({ ...prev, approvedOn: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      disabled={!canEdit}
                    />
                  </label>
                </div>

                <label className="space-y-1 text-xs block">
                  <span className="text-gray-500">Notes</span>
                  <textarea
                    value={formState.notes}
                    onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    rows={3}
                    disabled={!canEdit}
                  />
                </label>

                {canEdit && editMode && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={!isFormValid || createRuleMutation.isPending || updateRuleMutation.isPending}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      Create Rule
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


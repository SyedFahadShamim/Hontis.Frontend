import { apiClient } from './api';
import type {
  AttributionRuleListResponse,
  AttributionRuleDetailResponse,
  AttributionRuleQueryParams,
  CreateAttributionRuleRequest,
  UpdateAttributionRuleRequest,
  AttributionAllocationResponse,
  CreateAttributionAllocationRequest,
  UpdateAttributionAllocationRequest,
  PagedResult,
  RuleLevelLookupResponse,
  AllocationTypeLookupResponse,
  RuleStatusLookupResponse,
  PriceTypeLookupResponse,
  ClinicTypeLookupResponse,
  TaxTypeLookupResponse,
} from '../types';

export interface AttributionOverviewResponse {
  rawCount: number;
  normalizedCount: number;
  mappedCount: number;
  areaResolvedCount: number;
  ruleAppliedCount: number;
  attributedCount: number;
  exceptionCount: number;
}

export const attributionApi = {
  getOverview: async (): Promise<AttributionOverviewResponse> => {
    const response = await apiClient.get<AttributionOverviewResponse>('/attribution/overview');
    return response.data;
  },

  getRules: async (
    params?: AttributionRuleQueryParams
  ): Promise<PagedResult<AttributionRuleListResponse>> => {
    const response = await apiClient.get<PagedResult<AttributionRuleListResponse>>('/attribution/rules', {
      params,
    });
    return response.data;
  },

  getRuleById: async (id: number): Promise<AttributionRuleDetailResponse> => {
    const response = await apiClient.get<AttributionRuleDetailResponse>(`/attribution/rules/${id}`);
    return response.data;
  },

  createRule: async (data: CreateAttributionRuleRequest): Promise<AttributionRuleDetailResponse> => {
    const response = await apiClient.post<AttributionRuleDetailResponse>('/attribution/rules', data);
    return response.data;
  },

  updateRule: async (id: number, data: UpdateAttributionRuleRequest): Promise<AttributionRuleDetailResponse> => {
    const response = await apiClient.put<AttributionRuleDetailResponse>(`/attribution/rules/${id}`, data);
    return response.data;
  },

  deleteRule: async (id: number): Promise<void> => {
    await apiClient.delete(`/attribution/rules/${id}`);
  },

  getAllocations: async (ruleId: number): Promise<AttributionAllocationResponse[]> => {
    const response = await apiClient.get<AttributionAllocationResponse[]>(
      `/attribution/rules/${ruleId}/allocations`
    );
    return response.data;
  },

  createAllocation: async (
    ruleId: number,
    data: CreateAttributionAllocationRequest
  ): Promise<AttributionAllocationResponse> => {
    const response = await apiClient.post<AttributionAllocationResponse>(
      `/attribution/rules/${ruleId}/allocations`,
      data
    );
    return response.data;
  },

  updateAllocation: async (
    allocationId: number,
    data: UpdateAttributionAllocationRequest
  ): Promise<AttributionAllocationResponse> => {
    const response = await apiClient.put<AttributionAllocationResponse>(
      `/attribution/allocations/${allocationId}`,
      data
    );
    return response.data;
  },

  deleteAllocation: async (allocationId: number): Promise<void> => {
    await apiClient.delete(`/attribution/allocations/${allocationId}`);
  },

  getRuleLevels: async (): Promise<RuleLevelLookupResponse[]> => {
    const response = await apiClient.get<RuleLevelLookupResponse[]>('/lookups/rule-levels');
    return response.data;
  },

  getAllocationTypes: async (): Promise<AllocationTypeLookupResponse[]> => {
    const response = await apiClient.get<AllocationTypeLookupResponse[]>('/lookups/allocation-types');
    return response.data;
  },

  getRuleStatuses: async (): Promise<RuleStatusLookupResponse[]> => {
    const response = await apiClient.get<RuleStatusLookupResponse[]>('/lookups/rule-statuses');
    return response.data;
  },

  getPriceTypes: async (): Promise<PriceTypeLookupResponse[]> => {
    const response = await apiClient.get<PriceTypeLookupResponse[]>('/lookups/price-types');
    return response.data;
  },

  getClinicTypes: async (): Promise<ClinicTypeLookupResponse[]> => {
    const response = await apiClient.get<ClinicTypeLookupResponse[]>('/lookups/clinic-types');
    return response.data;
  },

  getTaxTypeLookups: async (): Promise<TaxTypeLookupResponse[]> => {
    const response = await apiClient.get<TaxTypeLookupResponse[]>('/lookups/tax-types-lookup');
    return response.data;
  },
};


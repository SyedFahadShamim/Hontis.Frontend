import { apiClient } from './api';
import type {
  ProductListResponse,
  ProductDetailResponse,
  CreateProductRequest,
  UpdateProductRequest,
  PagedResult,
  MoleculeListResponse,
  TaxTypeListResponse,
  ProductCategoryListResponse,
  ManufacturerListResponse,
  SupplierListResponse,
  DosageFormListResponse,
  ChangePricesRequest,
  ChangePricesResponse,
  PriceHistoryResponse,
  CurrentPricesResponse,
} from '../types';

export const productsApi = {
  getAll: async (params?: {
    search?: string;
    lifecycleStatus?: string;
    categoryCode?: string;
    manufacturerCode?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<ProductListResponse>> => {
    const response = await apiClient.get<PagedResult<ProductListResponse>>(
      '/products',
      { params }
    );
    return response.data;
  },

  getById: async (id: number): Promise<ProductDetailResponse> => {
    const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductRequest): Promise<ProductDetailResponse> => {
    const response = await apiClient.post<ProductDetailResponse>('/products', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProductRequest): Promise<ProductDetailResponse> => {
    const response = await apiClient.put<ProductDetailResponse>(`/products/${id}`, data);
    return response.data;
  },

  updateLifecycle: async (id: number, lifecycleStatus: string): Promise<void> => {
    await apiClient.patch(`/products/${id}/lifecycle`, { lifecycleStatus });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getMolecules: async (): Promise<MoleculeListResponse[]> => {
    const response = await apiClient.get<MoleculeListResponse[]>('/molecules');
    return response.data;
  },

  getTaxTypes: async (): Promise<TaxTypeListResponse[]> => {
    const response = await apiClient.get<TaxTypeListResponse[]>('/taxtypes');
    return response.data;
  },

  getActiveCategories: async (): Promise<ProductCategoryListResponse[]> => {
    const response = await apiClient.get<PagedResult<ProductCategoryListResponse>>(
      '/productcategories',
      { params: { status: 'Active', pageSize: 1000 } }
    );
    return response.data.items;
  },

  getActiveManufacturers: async (): Promise<ManufacturerListResponse[]> => {
    const response = await apiClient.get<PagedResult<ManufacturerListResponse>>(
      '/manufacturers',
      { params: { status: 'Active', pageSize: 1000 } }
    );
    return response.data.items;
  },

  getActiveSuppliers: async (): Promise<SupplierListResponse[]> => {
    const response = await apiClient.get<PagedResult<SupplierListResponse>>(
      '/suppliers',
      { params: { status: 'Active', pageSize: 1000 } }
    );
    return response.data.items;
  },

  getActiveDosageForms: async (): Promise<DosageFormListResponse[]> => {
    const response = await apiClient.get<PagedResult<DosageFormListResponse>>(
      '/dosage-forms',
      { params: { status: 'Active', pageSize: 1000 } }
    );
    return response.data.items;
  },

  changePrices: async (
    hontisProductCode: string,
    data: ChangePricesRequest
  ): Promise<ChangePricesResponse> => {
    const response = await apiClient.post<ChangePricesResponse>(
      `/products/${hontisProductCode}/change-prices`,
      data
    );
    return response.data;
  },

  getPriceHistory: async (hontisProductCode: string): Promise<PriceHistoryResponse[]> => {
    const response = await apiClient.get<PriceHistoryResponse[]>(
      `/products/${hontisProductCode}/price-history`
    );
    return response.data;
  },

  getCurrentPrices: async (hontisProductCode: string): Promise<CurrentPricesResponse> => {
    const response = await apiClient.get<CurrentPricesResponse>(
      `/products/${hontisProductCode}/current-prices`
    );
    return response.data;
  },
};

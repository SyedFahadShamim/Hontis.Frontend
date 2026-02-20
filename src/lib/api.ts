import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  UserProfileResponse,
  UserListResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  ResetPasswordResponse,
  RoleResponse,
  RoleDetailResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  PermissionDto,
  AssignPermissionsRequest,
  ProductCategoryListResponse,
  ProductCategoryDetailResponse,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
  PagedResult,
  ManufacturerListResponse,
  ManufacturerDetailResponse,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
  SupplierListResponse,
  SupplierDetailResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  DosageFormListResponse,
  DosageFormDetailResponse,
  CreateDosageFormRequest,
  UpdateDosageFormRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/auth/me');
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

export const usersApi = {
  getAll: async (search?: string): Promise<UserListResponse[]> => {
    const response = await apiClient.get<UserListResponse[]>('/users', {
      params: { search },
    });
    return response.data;
  },
  getById: async (id: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserRequest): Promise<UserDetailResponse> => {
    const response = await apiClient.post<UserDetailResponse>('/users', data);
    return response.data;
  },
  update: async (id: number, data: UpdateUserRequest): Promise<UserDetailResponse> => {
    const response = await apiClient.put<UserDetailResponse>(`/users/${id}`, data);
    return response.data;
  },
  toggleActive: async (id: number): Promise<void> => {
    await apiClient.patch(`/users/${id}/activate`);
  },
  resetPassword: async (id: number): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(`/users/${id}/reset-password`);
    return response.data;
  },
  assignRoles: async (id: number, data: AssignRolesRequest): Promise<void> => {
    await apiClient.post(`/users/${id}/roles`, data);
  },
};

export const rolesApi = {
  getAll: async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<RoleResponse[]>('/roles');
    return response.data;
  },
  getById: async (id: number): Promise<RoleDetailResponse> => {
    const response = await apiClient.get<RoleDetailResponse>(`/roles/${id}`);
    return response.data;
  },
  create: async (data: CreateRoleRequest): Promise<RoleDetailResponse> => {
    const response = await apiClient.post<RoleDetailResponse>('/roles', data);
    return response.data;
  },
  update: async (id: number, data: UpdateRoleRequest): Promise<RoleDetailResponse> => {
    const response = await apiClient.put<RoleDetailResponse>(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
  assignPermissions: async (id: number, data: AssignPermissionsRequest): Promise<void> => {
    await apiClient.post(`/roles/${id}/permissions`, data);
  },
};

export const permissionsApi = {
  getAll: async (): Promise<PermissionDto[]> => {
    const response = await apiClient.get<PermissionDto[]>('/permissions');
    return response.data;
  },
};

export const productCategoriesApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<ProductCategoryListResponse>> => {
    const response = await apiClient.get<PagedResult<ProductCategoryListResponse>>(
      '/productcategories',
      { params }
    );
    return response.data;
  },
  getById: async (id: number): Promise<ProductCategoryDetailResponse> => {
    const response = await apiClient.get<ProductCategoryDetailResponse>(
      `/productcategories/${id}`
    );
    return response.data;
  },
  create: async (data: CreateProductCategoryRequest): Promise<ProductCategoryDetailResponse> => {
    const response = await apiClient.post<ProductCategoryDetailResponse>(
      '/productcategories',
      data
    );
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateProductCategoryRequest
  ): Promise<ProductCategoryDetailResponse> => {
    const response = await apiClient.put<ProductCategoryDetailResponse>(
      `/productcategories/${id}`,
      data
    );
    return response.data;
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/productcategories/${id}/status`, { status });
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/productcategories/${id}`);
  },
};

export const manufacturersApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<ManufacturerListResponse>> => {
    const response = await apiClient.get<PagedResult<ManufacturerListResponse>>(
      '/manufacturers',
      { params }
    );
    return response.data;
  },
  getById: async (id: number): Promise<ManufacturerDetailResponse> => {
    const response = await apiClient.get<ManufacturerDetailResponse>(
      `/manufacturers/${id}`
    );
    return response.data;
  },
  create: async (data: CreateManufacturerRequest): Promise<ManufacturerDetailResponse> => {
    const response = await apiClient.post<ManufacturerDetailResponse>(
      '/manufacturers',
      data
    );
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateManufacturerRequest
  ): Promise<ManufacturerDetailResponse> => {
    const response = await apiClient.put<ManufacturerDetailResponse>(
      `/manufacturers/${id}`,
      data
    );
    return response.data;
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/manufacturers/${id}/status`, { status });
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/manufacturers/${id}`);
  },
};

export const suppliersApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<SupplierListResponse>> => {
    const response = await apiClient.get<PagedResult<SupplierListResponse>>(
      '/suppliers',
      { params }
    );
    return response.data;
  },
  getById: async (id: number): Promise<SupplierDetailResponse> => {
    const response = await apiClient.get<SupplierDetailResponse>(
      `/suppliers/${id}`
    );
    return response.data;
  },
  create: async (data: CreateSupplierRequest): Promise<SupplierDetailResponse> => {
    const response = await apiClient.post<SupplierDetailResponse>(
      '/suppliers',
      data
    );
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateSupplierRequest
  ): Promise<SupplierDetailResponse> => {
    const response = await apiClient.put<SupplierDetailResponse>(
      `/suppliers/${id}`,
      data
    );
    return response.data;
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/suppliers/${id}/status`, { status });
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

export const dosageFormsApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<DosageFormListResponse>> => {
    const response = await apiClient.get<PagedResult<DosageFormListResponse>>(
      '/dosage-forms',
      { params }
    );
    return response.data;
  },
  getById: async (id: number): Promise<DosageFormDetailResponse> => {
    const response = await apiClient.get<DosageFormDetailResponse>(
      `/dosage-forms/${id}`
    );
    return response.data;
  },
  create: async (data: CreateDosageFormRequest): Promise<DosageFormDetailResponse> => {
    const response = await apiClient.post<DosageFormDetailResponse>(
      '/dosage-forms',
      data
    );
    return response.data;
  },
  update: async (
    id: number,
    data: UpdateDosageFormRequest
  ): Promise<DosageFormDetailResponse> => {
    const response = await apiClient.put<DosageFormDetailResponse>(
      `/dosage-forms/${id}`,
      data
    );
    return response.data;
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/dosage-forms/${id}/status`, { status });
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/dosage-forms/${id}`);
  },
};

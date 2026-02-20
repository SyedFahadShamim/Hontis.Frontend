import { apiClient } from './api';
import type {
  DoctorListResponse,
  DoctorDetailResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  PagedResult,
  SpecialityLookupResponse,
  DoctorStatusLookupResponse,
  GeoRegionLookupResponse,
  GeoCityLookupResponse,
  GeoBrickLookupResponse,
} from '../types';

export const doctorsApi = {
  getAll: async (params?: {
    search?: string;
    doctorStatusCode?: string;
    specialityCode?: string;
    cityCode?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResult<DoctorListResponse>> => {
    const response = await apiClient.get<PagedResult<DoctorListResponse>>('/doctors', { params });
    return response.data;
  },

  getById: async (id: number): Promise<DoctorDetailResponse> => {
    const response = await apiClient.get<DoctorDetailResponse>(`/doctors/${id}`);
    return response.data;
  },

  create: async (data: CreateDoctorRequest): Promise<DoctorDetailResponse> => {
    const response = await apiClient.post<DoctorDetailResponse>('/doctors', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDoctorRequest): Promise<DoctorDetailResponse> => {
    const response = await apiClient.put<DoctorDetailResponse>(`/doctors/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/doctors/${id}/status`, { status });
  },

  updateDoctorStatusCode: async (id: number, doctorStatusCode: string): Promise<void> => {
    await apiClient.patch(`/doctors/${id}/doctor-status`, { doctorStatusCode });
  },

  getSpecialities: async (): Promise<SpecialityLookupResponse[]> => {
    const response = await apiClient.get<SpecialityLookupResponse[]>('/lookups/specialities');
    return response.data;
  },

  getDoctorStatuses: async (): Promise<DoctorStatusLookupResponse[]> => {
    const response = await apiClient.get<DoctorStatusLookupResponse[]>('/lookups/doctor-statuses');
    return response.data;
  },

  getGeoRegions: async (): Promise<GeoRegionLookupResponse[]> => {
    const response = await apiClient.get<GeoRegionLookupResponse[]>('/lookups/geo-regions');
    return response.data;
  },

  getGeoCities: async (regionCode?: string): Promise<GeoCityLookupResponse[]> => {
    const response = await apiClient.get<GeoCityLookupResponse[]>('/lookups/geo-cities', {
      params: regionCode ? { regionCode } : undefined,
    });
    return response.data;
  },

  getGeoBricks: async (cityCode?: string): Promise<GeoBrickLookupResponse[]> => {
    const response = await apiClient.get<GeoBrickLookupResponse[]>('/lookups/geo-bricks', {
      params: cityCode ? { cityCode } : undefined,
    });
    return response.data;
  },
};

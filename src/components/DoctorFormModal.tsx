import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { doctorsApi } from '../lib/doctors-api';
import type { CreateDoctorRequest, UpdateDoctorRequest } from '../types';

interface DoctorFormModalProps {
  doctorId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm: CreateDoctorRequest = {
  doctorCode: '',
  doctorName: '',
  specialityCode: '',
  doctorStatusCode: '',
  primaryCityCode: '',
  phone: '',
  email: '',
  onboardedOn: '',
  firstContactBy: '',
  notes: '',
  status: 'Active',
};

export const DoctorFormModal = ({ doctorId, onClose, onSuccess }: DoctorFormModalProps) => {
  const isEditing = doctorId !== null;
  const [formData, setFormData] = useState<CreateDoctorRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRegionCode, setSelectedRegionCode] = useState('');

  const { data: doctorDetail, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorsApi.getById(doctorId!),
    enabled: isEditing,
  });

  const { data: specialities = [] } = useQuery({
    queryKey: ['lookupSpecialities'],
    queryFn: doctorsApi.getSpecialities,
  });

  const { data: doctorStatuses = [] } = useQuery({
    queryKey: ['lookupDoctorStatuses'],
    queryFn: doctorsApi.getDoctorStatuses,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['lookupGeoRegions'],
    queryFn: doctorsApi.getGeoRegions,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['lookupGeoCities', selectedRegionCode],
    queryFn: () => doctorsApi.getGeoCities(selectedRegionCode || undefined),
  });

  useEffect(() => {
    if (doctorDetail && isEditing) {
      setFormData({
        doctorCode: doctorDetail.doctorCode,
        doctorName: doctorDetail.doctorName,
        specialityCode: doctorDetail.specialityCode,
        doctorStatusCode: doctorDetail.doctorStatusCode,
        primaryCityCode: doctorDetail.primaryCityCode ?? '',
        phone: doctorDetail.phone ?? '',
        email: doctorDetail.email ?? '',
        onboardedOn: doctorDetail.onboardedOn
          ? doctorDetail.onboardedOn.substring(0, 10)
          : '',
        firstContactBy: doctorDetail.firstContactBy ?? '',
        notes: doctorDetail.notes ?? '',
        status: doctorDetail.status,
      });

      if (doctorDetail.primaryCityCode) {
        const cityMatch = cities.find((c) => c.cityCode === doctorDetail.primaryCityCode);
        if (cityMatch?.regionCode) {
          setSelectedRegionCode(cityMatch.regionCode);
        }
      }
    }
  }, [doctorDetail, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorsApi.create(data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.message || 'Failed to create doctor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDoctorRequest) => doctorsApi.update(doctorId!, data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.message || 'Failed to update doctor');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.doctorCode.trim()) newErrors.doctorCode = 'Doctor code is required';
    if (!formData.doctorName.trim()) newErrors.doctorName = 'Doctor name is required';
    if (!formData.specialityCode) newErrors.specialityCode = 'Speciality is required';
    if (!formData.doctorStatusCode) newErrors.doctorStatusCode = 'Doctor status is required';
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    const payload = {
      ...formData,
      doctorCode: formData.doctorCode.toUpperCase().trim(),
      doctorName: formData.doctorName.trim(),
      primaryCityCode: formData.primaryCityCode || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      onboardedOn: formData.onboardedOn || undefined,
      firstContactBy: formData.firstContactBy || undefined,
      notes: formData.notes || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(payload as UpdateDoctorRequest);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError(null);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionCode(e.target.value);
    setFormData((prev) => ({ ...prev, primaryCityCode: '' }));
  };

  if (isLoadingDoctor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Doctor' : 'Add Doctor'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorCode"
                    value={formData.doctorCode}
                    onChange={handleChange}
                    placeholder="e.g. DR-00001"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                      errors.doctorCode ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {errors.doctorCode && (
                    <p className="text-xs text-red-600 mt-1">{errors.doctorCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Full name"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.doctorName ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {errors.doctorName && (
                    <p className="text-xs text-red-600 mt-1">{errors.doctorName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speciality <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialityCode"
                    value={formData.specialityCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.specialityCode ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select speciality</option>
                    {specialities.map((s) => (
                      <option key={s.specialityCode} value={s.specialityCode}>
                        {s.specialityName}
                      </option>
                    ))}
                  </select>
                  {errors.specialityCode && (
                    <p className="text-xs text-red-600 mt-1">{errors.specialityCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="doctorStatusCode"
                    value={formData.doctorStatusCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.doctorStatusCode ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select status</option>
                    {doctorStatuses.map((s) => (
                      <option key={s.doctorStatusCode} value={s.doctorStatusCode}>
                        {s.doctorStatusName}
                      </option>
                    ))}
                  </select>
                  {errors.doctorStatusCode && (
                    <p className="text-xs text-red-600 mt-1">{errors.doctorStatusCode}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={selectedRegionCode}
                    onChange={handleRegionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Regions</option>
                    {regions.map((r) => (
                      <option key={r.regionCode} value={r.regionCode}>
                        {r.regionName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary City
                  </label>
                  <select
                    name="primaryCityCode"
                    value={formData.primaryCityCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No city selected</option>
                    {cities.map((c) => (
                      <option key={c.cityCode} value={c.cityCode}>
                        {c.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Onboarding &amp; Tracking
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Onboarded On
                  </label>
                  <input
                    type="date"
                    name="onboardedOn"
                    value={formData.onboardedOn}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Contact By
                  </label>
                  <input
                    type="text"
                    name="firstContactBy"
                    value={formData.firstContactBy}
                    onChange={handleChange}
                    placeholder="Who brought doctor onboard"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                System
              </h3>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
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
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

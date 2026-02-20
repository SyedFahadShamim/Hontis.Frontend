import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { productsApi } from '../lib/products-api';
import type { CreateProductRequest, UpdateProductRequest } from '../types';

interface ProductFormModalProps {
  productId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormModal = ({ productId, onClose, onSuccess }: ProductFormModalProps) => {
  const isEditing = productId !== null;

  const [formData, setFormData] = useState<CreateProductRequest>({
    hontisProductCode: '',
    productName: '',
    brandName: '',
    dosageFormCode: '',
    categoryCode: '',
    manufacturerCode: '',
    supplierCode: '',
    primaryMoleculeCode: '',
    salesTaxTypeCode: '',
    salesTaxValue: 0,
    advIncomeTaxTypeCode: '',
    advIncomeTaxValue: 0,
    mrpCurrent: 0,
    tradePriceCurrent: 0,
    distributionPriceCurrent: 0,
    productPriceCurrent: 0,
    priceEffectiveFrom: '',
    lifecycleStatus: 'Draft',
    skuPriceCode: '',
  });

  const { data: productDetail, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId!),
    enabled: isEditing,
  });

  const { data: categories } = useQuery({
    queryKey: ['lookupCategories'],
    queryFn: productsApi.getActiveCategories,
  });

  const { data: manufacturers } = useQuery({
    queryKey: ['lookupManufacturers'],
    queryFn: productsApi.getActiveManufacturers,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['lookupSuppliers'],
    queryFn: productsApi.getActiveSuppliers,
  });

  const { data: dosageForms } = useQuery({
    queryKey: ['lookupDosageForms'],
    queryFn: productsApi.getActiveDosageForms,
  });

  const { data: molecules } = useQuery({
    queryKey: ['lookupMolecules'],
    queryFn: productsApi.getMolecules,
  });

  const { data: taxTypes } = useQuery({
    queryKey: ['lookupTaxTypes'],
    queryFn: productsApi.getTaxTypes,
  });

  useEffect(() => {
    if (productDetail) {
      setFormData({
        hontisProductCode: productDetail.hontisProductCode,
        productName: productDetail.productName,
        brandName: productDetail.brandName || '',
        dosageFormCode: productDetail.dosageFormCode || '',
        categoryCode: productDetail.categoryCode || '',
        manufacturerCode: productDetail.manufacturerCode || '',
        supplierCode: productDetail.supplierCode || '',
        primaryMoleculeCode: productDetail.primaryMoleculeCode || '',
        salesTaxTypeCode: productDetail.salesTaxTypeCode || '',
        salesTaxValue: productDetail.salesTaxValue,
        advIncomeTaxTypeCode: productDetail.advIncomeTaxTypeCode || '',
        advIncomeTaxValue: productDetail.advIncomeTaxValue,
        mrpCurrent: productDetail.mrpCurrent,
        tradePriceCurrent: productDetail.tradePriceCurrent,
        distributionPriceCurrent: productDetail.distributionPriceCurrent,
        productPriceCurrent: productDetail.productPriceCurrent,
        priceEffectiveFrom: productDetail.priceEffectiveFrom
          ? productDetail.priceEffectiveFrom.split('T')[0]
          : '',
        lifecycleStatus: productDetail.lifecycleStatus,
        skuPriceCode: '',
      });
    }
  }, [productDetail]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      alert('Product created successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => productsApi.update(productId!, data),
    onSuccess: () => {
      alert('Product updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update product');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      hontisProductCode: formData.hontisProductCode.toUpperCase().trim(),
      dosageFormCode: formData.dosageFormCode || undefined,
      categoryCode: formData.categoryCode || undefined,
      manufacturerCode: formData.manufacturerCode || undefined,
      supplierCode: formData.supplierCode || undefined,
      primaryMoleculeCode: formData.primaryMoleculeCode || undefined,
      salesTaxTypeCode: formData.salesTaxTypeCode || undefined,
      advIncomeTaxTypeCode: formData.advIncomeTaxTypeCode || undefined,
      priceEffectiveFrom: formData.priceEffectiveFrom || undefined,
    };

    if (isEditing) {
      const { skuPriceCode: _sku, ...updatePayload } = payload;
      updateMutation.mutate(updatePayload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code *
              </label>
              <input
                type="text"
                name="hontisProductCode"
                value={formData.hontisProductCode}
                onChange={handleChange}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="e.g., HTS-KOFF-120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lifecycle Status *
              </label>
              <select
                name="lifecycleStatus"
                value={formData.lifecycleStatus}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Discontinued">Discontinued</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Kuff-Off Syrup 120ml"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName || ''}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Kuff-Off"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Form
                </label>
                <select
                  name="dosageFormCode"
                  value={formData.dosageFormCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {dosageForms?.map((df) => (
                    <option key={df.dosageFormCode} value={df.dosageFormCode}>
                      {df.dosageFormName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryCode"
                  value={formData.categoryCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {categories?.map((cat) => (
                    <option key={cat.categoryCode} value={cat.categoryCode}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <select
                  name="manufacturerCode"
                  value={formData.manufacturerCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {manufacturers?.map((mfg) => (
                    <option key={mfg.manufacturerCode} value={mfg.manufacturerCode}>
                      {mfg.manufacturerName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  name="supplierCode"
                  value={formData.supplierCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {suppliers?.map((sup) => (
                    <option key={sup.supplierCode} value={sup.supplierCode}>
                      {sup.supplierName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Molecule
                </label>
                <select
                  name="primaryMoleculeCode"
                  value={formData.primaryMoleculeCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {molecules?.map((mol) => (
                    <option key={mol.moleculeCode} value={mol.moleculeCode}>
                      {mol.moleculeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Tax Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Tax Type
                </label>
                <select
                  name="salesTaxTypeCode"
                  value={formData.salesTaxTypeCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {taxTypes?.map((tt) => (
                    <option key={tt.taxTypeCode} value={tt.taxTypeCode}>
                      {tt.taxTypeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Tax Value
                </label>
                <input
                  type="number"
                  name="salesTaxValue"
                  value={formData.salesTaxValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Income Tax Type
                </label>
                <select
                  name="advIncomeTaxTypeCode"
                  value={formData.advIncomeTaxTypeCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select --</option>
                  {taxTypes?.map((tt) => (
                    <option key={tt.taxTypeCode} value={tt.taxTypeCode}>
                      {tt.taxTypeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Income Tax Value
                </label>
                <input
                  type="number"
                  name="advIncomeTaxValue"
                  value={formData.advIncomeTaxValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRP (Current)
                </label>
                <input
                  type="number"
                  name="mrpCurrent"
                  value={formData.mrpCurrent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Price (Current)
                </label>
                <input
                  type="number"
                  name="tradePriceCurrent"
                  value={formData.tradePriceCurrent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distribution Price (Current)
                </label>
                <input
                  type="number"
                  name="distributionPriceCurrent"
                  value={formData.distributionPriceCurrent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Price (Current)
                </label>
                <input
                  type="number"
                  name="productPriceCurrent"
                  value={formData.productPriceCurrent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU Price Code *
                  </label>
                  <input
                    type="text"
                    name="skuPriceCode"
                    value={formData.skuPriceCode}
                    onChange={handleChange}
                    required={!isEditing}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., INIT-2025-01"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Effective From
                </label>
                <input
                  type="date"
                  name="priceEffectiveFrom"
                  value={formData.priceEffectiveFrom || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Loader2, DollarSign } from 'lucide-react';
import { productsApi } from '../lib/products-api';
import type { ChangePricesRequest } from '../types';

interface ChangePricesModalProps {
  hontisProductCode: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePricesModal = ({
  hontisProductCode,
  productName,
  onClose,
  onSuccess,
}: ChangePricesModalProps) => {
  const { data: currentPrices, isLoading } = useQuery({
    queryKey: ['currentPrices', hontisProductCode],
    queryFn: () => productsApi.getCurrentPrices(hontisProductCode),
  });

  const [formData, setFormData] = useState<ChangePricesRequest>({
    effectiveFrom: '',
    skuPriceCode: '',
    mrp: 0,
    tradePrice: 0,
    distributionPrice: 0,
    productPrice: 0,
    currency: 'PKR',
    source: 'Manufacturer',
    notes: '',
  });

  const changePricesMutation = useMutation({
    mutationFn: (data: ChangePricesRequest) =>
      productsApi.changePrices(hontisProductCode, data),
    onSuccess: () => {
      alert('Prices updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to change prices');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const type = 'type' in e.target ? e.target.type : 'text';
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.skuPriceCode.trim()) {
      alert('SKU Price Code is required');
      return;
    }
    if (!formData.effectiveFrom) {
      alert('Effective From date is required');
      return;
    }
    if (currentPrices?.priceEffectiveFrom) {
      const currentDate = new Date(currentPrices.priceEffectiveFrom);
      const newDate = new Date(formData.effectiveFrom);
      if (newDate <= currentDate) {
        alert(
          `Effective From must be after the current effective date (${currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})`
        );
        return;
      }
    }
    if (formData.mrp < 0 || formData.tradePrice < 0 || formData.distributionPrice < 0 || formData.productPrice < 0) {
      alert('All prices must be 0 or greater');
      return;
    }
    if (formData.mrp <= 0) {
      alert('MRP must be greater than 0');
      return;
    }
    const hasInvalidDecimals = [formData.mrp, formData.tradePrice, formData.distributionPrice, formData.productPrice].some(
      (v) => {
        const parts = v.toString().split('.');
        return parts.length > 1 && parts[1].length > 2;
      }
    );
    if (hasInvalidDecimals) {
      alert('Prices must have at most 2 decimal places');
      return;
    }

    changePricesMutation.mutate({
      ...formData,
      skuPriceCode: formData.skuPriceCode.trim(),
      source: formData.source || undefined,
      notes: formData.notes || undefined,
    } as ChangePricesRequest);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading current prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Change Prices
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {hontisProductCode} - {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {currentPrices && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Current Prices
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-xs text-gray-500">MRP</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(currentPrices.mrpCurrent)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Trade</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(currentPrices.tradePriceCurrent)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Distribution</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(currentPrices.distributionPriceCurrent)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Product</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(currentPrices.productPriceCurrent)}
                </p>
              </div>
            </div>
            {currentPrices.currentSkuPriceCode && (
              <p className="text-xs text-gray-500 mt-2">
                Current SKU: {currentPrices.currentSkuPriceCode}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU Price Code *
              </label>
              <input
                type="text"
                name="skuPriceCode"
                value={formData.skuPriceCode}
                onChange={handleChange}
                required
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MFG-PRICE-2026-02-A"
              />
              <p className="mt-1 text-xs text-gray-500">
                Manufacturer provided price revision code. Required for every price change.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From *
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              New Prices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRP *
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Price
                </label>
                <input
                  type="number"
                  name="tradePrice"
                  value={formData.tradePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distribution Price
                </label>
                <input
                  type="number"
                  name="distributionPrice"
                  value={formData.distributionPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Price
                </label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
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
              Additional Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source || 'Manufacturer'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Manual">Manual</option>
                  <option value="Policy">Policy</option>
                  <option value="DC">DC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Optional notes about this price change..."
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
              disabled={changePricesMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {changePricesMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                {changePricesMutation.isPending
                  ? 'Updating...'
                  : 'Update Prices'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

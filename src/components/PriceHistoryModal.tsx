import { useQuery } from '@tanstack/react-query';
import { X, Loader2, History } from 'lucide-react';
import { productsApi } from '../lib/products-api';

interface PriceHistoryModalProps {
  hontisProductCode: string;
  productName: string;
  onClose: () => void;
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  MRP: 'MRP',
  TRADE: 'Trade Price',
  DISTRIBUTION: 'Distribution Price',
  PRODUCT: 'Product Price',
};

const PRICE_TYPE_COLORS: Record<string, string> = {
  MRP: 'bg-blue-100 text-blue-800',
  TRADE: 'bg-green-100 text-green-800',
  DISTRIBUTION: 'bg-amber-100 text-amber-800',
  PRODUCT: 'bg-teal-100 text-teal-800',
};

export const PriceHistoryModal = ({
  hontisProductCode,
  productName,
  onClose,
}: PriceHistoryModalProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['priceHistory', hontisProductCode],
    queryFn: () => productsApi.getPriceHistory(hontisProductCode),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupedBySku = (history || []).reduce(
    (acc, item) => {
      if (!acc[item.skuPriceCode]) {
        acc[item.skuPriceCode] = [];
      }
      acc[item.skuPriceCode].push(item);
      return acc;
    },
    {} as Record<string, typeof history>
  );

  const skuCodes = Object.keys(groupedBySku);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Price History
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

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading price history...</p>
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No price history found for this product.
            </div>
          ) : (
            <div className="space-y-6">
              {skuCodes.map((skuCode) => {
                const items = groupedBySku[skuCode]!;
                const firstItem = items[0];
                const isActive = !firstItem.effectiveTo;

                return (
                  <div
                    key={skuCode}
                    className={`border rounded-lg overflow-hidden ${
                      isActive
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 flex items-center justify-between ${
                        isActive ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-gray-800">
                          {skuCode}
                        </span>
                        {isActive && (
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Effective: {formatDate(firstItem.effectiveFrom)}
                        {firstItem.effectiveTo &&
                          ` to ${formatDate(firstItem.effectiveTo)}`}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Type
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Effective To
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Source
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Notes
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {items.map((item) => (
                            <tr
                              key={item.priceHistoryId}
                              className="hover:bg-gray-50/50"
                            >
                              <td className="px-4 py-2">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    PRICE_TYPE_COLORS[item.priceTypeCode] ||
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {PRICE_TYPE_LABELS[item.priceTypeCode] ||
                                    item.priceTypeCode}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                {formatCurrency(item.priceValue)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {item.effectiveTo ? (
                                  <span className="text-gray-600">{formatDate(item.effectiveTo)}</span>
                                ) : (
                                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {item.source || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 max-w-[150px] truncate" title={item.notes || ''}>
                                {item.notes || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                <div>{formatDate(item.createdOn)}</div>
                                {item.createdBy && (
                                  <div className="text-xs text-gray-400">
                                    by {item.createdBy}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  DollarSign,
  History,
} from 'lucide-react';
import { productsApi } from '../lib/products-api';
import { ProductFormModal } from '../components/ProductFormModal';
import { ChangePricesModal } from '../components/ChangePricesModal';
import { PriceHistoryModal } from '../components/PriceHistoryModal';
import type { ProductListResponse } from '../types';

const LIFECYCLE_COLORS: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-green-100 text-green-800',
  Discontinued: 'bg-orange-100 text-orange-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [changePricesProduct, setChangePricesProduct] =
    useState<ProductListResponse | null>(null);
  const [priceHistoryProduct, setPriceHistoryProduct] =
    useState<ProductListResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: [
      'products',
      searchTerm,
      statusFilter,
      page,
      pageSize,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      productsApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        pageSize,
        sortBy: sortBy || undefined,
        sortDir,
      }),
  });

  const updateLifecycleMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      productsApi.updateLifecycle(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleEdit = (product: ProductListResponse) => {
    setEditingProductId(product.productId);
    setShowModal(true);
  };

  const handleDelete = (product: ProductListResponse) => {
    if (
      confirm(`Are you sure you want to discontinue "${product.productName}"?`)
    ) {
      deleteMutation.mutate(product.productId);
    }
  };

  const handleLifecycleChange = (
    product: ProductListResponse,
    newStatus: string
  ) => {
    updateLifecycleMutation.mutate({
      id: product.productId,
      status: newStatus,
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProductId(null);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    handleModalClose();
  };

  const handleChangePricesSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setChangePricesProduct(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage product master data</p>
        </div>
        <button
          onClick={() => {
            setEditingProductId(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by code, name, or brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Discontinued">Discontinued</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('productcode')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Code <SortIcon column="productcode" />
                    </th>
                    <th
                      onClick={() => handleSort('productname')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Product <SortIcon column="productname" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manufacturer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU Price Code
                    </th>
                    <th
                      onClick={() => handleSort('mrp')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      MRP <SortIcon column="mrp" />
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Status <SortIcon column="status" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result?.items.map((product) => (
                    <tr
                      key={product.productId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingCart className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {product.hontisProductCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {product.productName}
                        </div>
                        {product.brandName && (
                          <div className="text-xs text-gray-500">
                            {product.brandName}
                          </div>
                        )}
                        {product.dosageFormName && (
                          <div className="text-xs text-gray-400">
                            {product.dosageFormName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.categoryName || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.manufacturerName || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {product.currentSkuPriceCode ? (
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.currentSkuPriceCode}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(product.mrpCurrent)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={product.lifecycleStatus}
                          onChange={(e) =>
                            handleLifecycleChange(product, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${
                            LIFECYCLE_COLORS[product.lifecycleStatus] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Active">Active</option>
                          <option value="Discontinued">Discontinued</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setChangePricesProduct(product)}
                            className="text-green-600 hover:text-green-800 inline-flex items-center p-1 rounded hover:bg-green-50 transition-colors"
                            title="Change Prices"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPriceHistoryProduct(product)}
                            className="text-amber-600 hover:text-amber-800 inline-flex items-center p-1 rounded hover:bg-amber-50 transition-colors"
                            title="Price History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-800 inline-flex items-center p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {result?.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {result && result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {(page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, result.totalCount)} of{' '}
                  {result.totalCount} results
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {result.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === result.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <ProductFormModal
          productId={editingProductId}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {changePricesProduct && (
        <ChangePricesModal
          hontisProductCode={changePricesProduct.hontisProductCode}
          productName={changePricesProduct.productName}
          onClose={() => setChangePricesProduct(null)}
          onSuccess={handleChangePricesSuccess}
        />
      )}

      {priceHistoryProduct && (
        <PriceHistoryModal
          hontisProductCode={priceHistoryProduct.hontisProductCode}
          productName={priceHistoryProduct.productName}
          onClose={() => setPriceHistoryProduct(null)}
        />
      )}
    </div>
  );
};

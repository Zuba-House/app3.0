import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  Plus, Search, Edit, Trash2, Eye, Package, 
  CheckCircle, Clock, XCircle, AlertTriangle 
} from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getProducts({
        page: pagination.page,
        limit: 10,
        search: search,
        status: statusFilter || undefined,
      });
      setProducts(response.data.data.items);
      setPagination({
        page: response.data.data.page,
        pages: response.data.data.pages,
        total: response.data.data.total,
      });
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    try {
      await vendorApi.deleteProduct(deleteModal.product._id);
      toast.success('Product deleted successfully');
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadge = (status, approvalStatus) => {
    // Priority: Show approval status first
    if (approvalStatus === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Pending Review
        </span>
      );
    }
    if (approvalStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    }
    if (approvalStatus === 'APPROVED') {
      // Check if also published
      const isPublished = status?.toLowerCase() === 'published';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPublished ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          <CheckCircle className="w-3 h-3 mr-1" /> {isPublished ? 'Live' : 'Approved'}
        </span>
      );
    }
    // Default: Draft or unknown
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <AlertTriangle className="w-3 h-3 mr-1" /> Draft
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">My Products</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your product listings</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] transition-colors text-sm md:text-base font-medium w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-[#efb291]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 md:py-12 px-4">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-sm md:text-base text-gray-500 mb-4">Start by adding your first product</p>
            <Link
              to="/products/new"
              className="inline-flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Add Product
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product._id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-3">
                    <img
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      src={
                        (product.images?.[0]?.url) ||
                        (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||
                        product.featuredImage ||
                        product.image ||
                        'https://via.placeholder.com/64?text=No+Image'
                      }
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku || 'N/A'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.pricing?.price || product.price || 0)}
                        </span>
                        <span className={`text-xs font-medium ${
                          (product.inventory?.stock || product.countInStock || product.stock || 0) <= 0 ? 'text-red-600' : 
                          (product.inventory?.stock || product.countInStock || product.stock || 0) <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.inventory?.endlessStock ? '∞' : 
                           `${product.inventory?.stock || product.countInStock || product.stock || 0} in stock`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    {getStatusBadge(product.status, product.approvalStatus)}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/products/${product._id}/edit`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, product })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 lg:h-12 lg:w-12">
                            <img
                              className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover"
                              src={
                                // Handle multiple image formats
                                (product.images?.[0]?.url) ||  // New format: {url: ...}
                                (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||  // Old format: string
                                product.featuredImage ||
                                product.image ||
                                'https://via.placeholder.com/48?text=No+Image'
                              }
                              alt={product.name}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                            />
                          </div>
                          <div className="ml-3 lg:ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.pricing?.price || product.price || 0)}
                        </div>
                        {(product.pricing?.regularPrice || product.oldPrice) && 
                         (product.pricing?.regularPrice || product.oldPrice) > (product.pricing?.price || product.price) && (
                          <div className="text-xs lg:text-sm text-gray-500 line-through">
                            {formatCurrency(product.pricing?.regularPrice || product.oldPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          (product.inventory?.stock || product.countInStock || product.stock || 0) <= 0 ? 'text-red-600' : 
                          (product.inventory?.stock || product.countInStock || product.stock || 0) <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.inventory?.endlessStock ? '∞ Unlimited' : 
                           `${product.inventory?.stock || product.countInStock || product.stock || 0} units`}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status, product.approvalStatus)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 lg:space-x-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}/edit`)}
                            className="p-1.5 lg:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, product })}
                            className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Responsive */}
            {pagination.pages > 1 && (
              <div className="bg-white px-3 md:px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-xs sm:text-sm text-gray-600">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal - Responsive */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md safe-area-bottom">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete "{deleteModal.product?.name}"? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

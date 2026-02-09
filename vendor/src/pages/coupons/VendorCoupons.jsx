import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  Plus, Search, Edit, Trash2, Tag, 
  CheckCircle, XCircle, Clock, Percent, DollarSign 
} from 'lucide-react';

const VendorCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null });
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [pagination.page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getCoupons({
        page: pagination.page,
        limit: 10,
        search: search || undefined,
      });
      setCoupons(response.data.data?.items || []);
      setPagination({
        page: response.data.data?.page || 1,
        pages: response.data.data?.pages || 1,
        total: response.data.data?.total || 0,
      });
    } catch (error) {
      console.error('Fetch coupons error:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchCoupons();
  };

  const handleToggle = async (couponId) => {
    try {
      setToggling(couponId);
      await vendorApi.toggleCoupon(couponId);
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      console.error('Toggle coupon error:', error);
      toast.error('Failed to update coupon status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.coupon) return;
    
    try {
      await vendorApi.deleteCoupon(deleteModal.coupon._id);
      toast.success('Coupon deleted successfully');
      setDeleteModal({ open: false, coupon: null });
      fetchCoupons();
    } catch (error) {
      console.error('Delete coupon error:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" /> Inactive
        </span>
      );
    }
    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" /> Scheduled
        </span>
      );
    }
    if (now > endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Active
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <Link
          to="/coupons/new"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Coupon
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coupons by code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Coupons Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#efb291]"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-500 mb-4">Create your first discount coupon</p>
            <Link
              to="/coupons/new"
              className="inline-flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Coupon
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-[#efb291] bg-opacity-20 p-2 rounded-lg mr-3">
                            <Tag className="w-5 h-5 text-[#efb291]" />
                          </div>
                          <div>
                            <div className="text-sm font-mono font-bold text-gray-900">
                              {coupon.code}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {coupon.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <>
                              <Percent className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                {coupon.discountValue}% off
                              </span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                ${coupon.discountValue} off
                              </span>
                            </>
                          )}
                        </div>
                        {coupon.minPurchase > 0 && (
                          <div className="text-xs text-gray-500">
                            Min. ${coupon.minPurchase}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {formatDate(coupon.startDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(coupon.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggle(coupon._id)}
                            disabled={toggling === coupon._id}
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {toggling === coupon._id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : coupon.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            to={`/coupons/${coupon._id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, coupon })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} coupons
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Coupon</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the coupon "{deleteModal.coupon?.code}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModal({ open: false, coupon: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default VendorCoupons;

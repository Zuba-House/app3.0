import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Package, Users, BarChart2, PieChart, Eye 
} from 'lucide-react';

const AnalyticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#efb291]"></div>
      </div>
    );
  }

  const orderStatusData = stats?.stats?.orderStatusCounts || {};
  const totalOrders = stats?.stats?.totalOrders || 0;

  const orderStatusColors = {
    RECEIVED: { bg: 'bg-gray-500', label: 'Received' },
    PROCESSING: { bg: 'bg-yellow-500', label: 'Processing' },
    SHIPPED: { bg: 'bg-blue-500', label: 'Shipped' },
    OUT_FOR_DELIVERY: { bg: 'bg-indigo-500', label: 'Out for Delivery' },
    DELIVERED: { bg: 'bg-green-500', label: 'Delivered' },
    CANCELLED: { bg: 'bg-red-500', label: 'Cancelled' },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your store performance and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(stats?.stats?.totalRevenue)}
              </p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{formatCurrency(stats?.stats?.todayRevenue)} today</span>
              </div>
            </div>
            <div className="bg-green-50 text-green-600 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {stats?.stats?.totalOrders || 0}
              </p>
              <div className="flex items-center mt-2 text-blue-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{stats?.stats?.todayOrders || 0} today</span>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {stats?.stats?.totalProducts || 0}
              </p>
              <div className="flex items-center mt-2 text-purple-600 text-sm">
                <Package className="w-4 h-4 mr-1" />
                <span>{stats?.stats?.publishedProducts || 0} published</span>
              </div>
            </div>
            <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(stats?.earnings?.availableBalance)}
              </p>
              <div className="flex items-center mt-2 text-yellow-600 text-sm">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>{formatCurrency(stats?.earnings?.pendingBalance)} pending</span>
              </div>
            </div>
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Order Status Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(orderStatusColors).map(([status, config]) => {
              const count = orderStatusData[status] || 0;
              const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{config.label}</span>
                    <span className="text-sm font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${config.bg} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Earnings Overview</h2>
            <BarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {formatCurrency(stats?.earnings?.totalSales)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {formatCurrency(stats?.earnings?.totalEarnings)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-600 text-sm">Available Balance</p>
              <p className="text-xl font-bold text-green-700 mt-1">
                {formatCurrency(stats?.earnings?.availableBalance)}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-600 text-sm">Pending Balance</p>
              <p className="text-xl font-bold text-yellow-700 mt-1">
                {formatCurrency(stats?.earnings?.pendingBalance)}
              </p>
            </div>
          </div>

          {/* Commission Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#0b2735] to-[#1a3d52] rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Platform Commission</p>
                <p className="text-2xl font-bold text-[#efb291]">
                  {stats?.vendor?.commissionRate || 10}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm">Your Share</p>
                <p className="text-2xl font-bold">
                  {100 - (stats?.vendor?.commissionRate || 10)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Performance Summary</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {orderStatusData.DELIVERED || 0}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {(orderStatusData.PROCESSING || 0) + (orderStatusData.SHIPPED || 0)}
            </p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {orderStatusData.CANCELLED || 0}
            </p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;

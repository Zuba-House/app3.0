import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, 
  Clock, CheckCircle, Truck, AlertCircle, XCircle, Eye 
} from 'lucide-react';

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, profileRes] = await Promise.all([
        vendorApi.getDashboard(),
        vendorApi.getProfile()
      ]);
      setDashboardData(dashboardRes.data.data);
      setProfile(profileRes.data.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-[#efb291]"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const earnings = dashboardData?.earnings || {};

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      subtitle: `${stats.publishedProducts || 0} published`,
      icon: <Package className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      subtitle: `${stats.todayOrders || 0} today`,
      icon: <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.todayRevenue)} today`,
      icon: <DollarSign className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Available Balance',
      value: formatCurrency(earnings.availableBalance),
      subtitle: `${formatCurrency(earnings.pendingBalance)} pending`,
      icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const orderStatusCards = [
    { key: 'RECEIVED', label: 'Received', icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />, color: 'text-gray-600 bg-gray-100' },
    { key: 'PROCESSING', label: 'Processing', icon: <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />, color: 'text-yellow-600 bg-yellow-100' },
    { key: 'SHIPPED', label: 'Shipped', icon: <Truck className="w-4 h-4 md:w-5 md:h-5" />, color: 'text-blue-600 bg-blue-100' },
    { key: 'DELIVERED', label: 'Delivered', icon: <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />, color: 'text-green-600 bg-green-100' },
    { key: 'CANCELLED', label: 'Cancelled', icon: <XCircle className="w-4 h-4 md:w-5 md:h-5" />, color: 'text-red-600 bg-red-100' }
  ];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0b2735]">
          Welcome back, {profile?.storeName || 'Vendor'}! 👋
        </h1>
        <p className="text-sm md:text-base text-[#0b2735] text-opacity-70 mt-1 md:mt-2">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Account Status Alert */}
      {profile?.status === 'PENDING' && (
        <div className="bg-[#efb291] bg-opacity-20 border-l-4 border-[#efb291] p-4 md:p-5 mb-6 md:mb-8 rounded-2xl shadow-soft">
          <div className="flex items-start md:items-center">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-[#efb291] mr-3 md:mr-4 flex-shrink-0 mt-0.5 md:mt-0" />
            <div>
              <h3 className="font-semibold text-[#0b2735] text-sm md:text-base">Account Pending Approval</h3>
              <p className="text-[#0b2735] text-opacity-80 text-xs md:text-sm mt-1">
                Your vendor account is under review. You'll be notified once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile?.status === 'SUSPENDED' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-5 mb-6 md:mb-8 rounded-2xl shadow-soft">
          <div className="flex items-start md:items-center">
            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500 mr-3 md:mr-4 flex-shrink-0 mt-0.5 md:mt-0" />
            <div>
              <h3 className="font-semibold text-red-800 text-sm md:text-base">Account Suspended</h3>
              <p className="text-red-700 text-xs md:text-sm mt-1">
                Your vendor account has been suspended. Please contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-soft border border-[#e5e2db] p-4 md:p-5 lg:p-6 hover:shadow-medium transition-all">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[#0b2735] text-opacity-60 text-xs md:text-sm font-medium truncate">{card.title}</p>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-[#0b2735] mt-2 md:mt-3 truncate">{card.value}</p>
                <p className="text-[#0b2735] text-opacity-50 text-xs md:text-sm mt-1 md:mt-2 truncate">{card.subtitle}</p>
              </div>
              <div className={`${card.bgLight} ${card.textColor} p-2.5 md:p-3 rounded-xl flex-shrink-0 ml-2 shadow-soft`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="bg-white rounded-2xl shadow-soft border border-[#e5e2db] p-4 md:p-5 lg:p-6 mb-6 md:mb-8">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-[#0b2735] mb-4 md:mb-5">Order Status Overview</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {orderStatusCards.map((status) => (
            <div key={status.key} className={`${status.color} rounded-xl p-3 md:p-4 lg:p-5 text-center shadow-soft hover:shadow-medium transition-all`}>
              <div className="flex justify-center mb-2 md:mb-3">{status.icon}</div>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.orderStatusCounts?.[status.key] || 0}</p>
              <p className="text-xs md:text-sm font-medium truncate mt-1">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Mobile Scrollable */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-semibold text-[#0b2735] mb-4 md:hidden">Quick Actions</h2>
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-2 md:pb-0 -mx-3 px-3 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
          <Link 
            to="/products/new" 
            className="min-w-[220px] md:min-w-0 flex-shrink-0 md:flex-shrink bg-gradient-to-br from-[#0b2735] to-[#0b2735] text-white rounded-2xl p-5 md:p-6 lg:p-7 hover:shadow-large transition-all snap-start shadow-medium group"
          >
            <Package className="w-7 h-7 md:w-9 md:h-9 mb-3 md:mb-4 text-[#efb291] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-1 md:mb-2">Add New Product</h3>
            <p className="text-white text-opacity-80 text-xs md:text-sm">List a new product in your store</p>
          </Link>

          <Link 
            to="/orders" 
            className="min-w-[220px] md:min-w-0 flex-shrink-0 md:flex-shrink bg-gradient-to-br from-[#efb291] to-[#efb291] text-[#0b2735] rounded-2xl p-5 md:p-6 lg:p-7 hover:shadow-large transition-all snap-start shadow-medium group"
          >
            <ShoppingCart className="w-7 h-7 md:w-9 md:h-9 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-1 md:mb-2">View Orders</h3>
            <p className="text-[#0b2735] text-opacity-80 text-xs md:text-sm">Manage and fulfill your orders</p>
          </Link>

          <Link 
            to="/finance/withdrawals" 
            className="min-w-[220px] md:min-w-0 flex-shrink-0 md:flex-shrink bg-gradient-to-br from-[#0b2735] to-[#0b2735] text-white rounded-2xl p-5 md:p-6 lg:p-7 hover:shadow-large transition-all snap-start shadow-medium group"
          >
            <DollarSign className="w-7 h-7 md:w-9 md:h-9 mb-3 md:mb-4 text-[#efb291] group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-1 md:mb-2">Request Withdrawal</h3>
            <p className="text-white text-opacity-80 text-xs md:text-sm">Withdraw your earnings</p>
          </Link>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="bg-white rounded-2xl shadow-soft border border-[#e5e2db] p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-base md:text-lg lg:text-xl font-semibold text-[#0b2735]">Earnings Summary</h2>
          <Link to="/finance/earnings" className="text-[#efb291] hover:text-[#0b2735] text-xs md:text-sm font-medium flex items-center transition-colors">
            View Details <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          <div className="bg-[#e5e2db] bg-opacity-50 rounded-xl p-3 md:p-4 lg:p-5 shadow-soft hover:shadow-medium transition-all">
            <p className="text-[#0b2735] text-opacity-60 text-xs md:text-sm font-medium">Total Sales</p>
            <p className="text-base md:text-lg lg:text-xl font-bold text-[#0b2735] truncate mt-1">{formatCurrency(earnings.totalSales)}</p>
          </div>
          <div className="bg-[#e5e2db] bg-opacity-50 rounded-xl p-3 md:p-4 lg:p-5 shadow-soft hover:shadow-medium transition-all">
            <p className="text-[#0b2735] text-opacity-60 text-xs md:text-sm font-medium">Total Earnings</p>
            <p className="text-base md:text-lg lg:text-xl font-bold text-[#0b2735] truncate mt-1">{formatCurrency(earnings.totalEarnings)}</p>
          </div>
          <div className="bg-[#efb291] bg-opacity-20 rounded-xl p-3 md:p-4 lg:p-5 shadow-soft hover:shadow-medium transition-all">
            <p className="text-[#0b2735] text-opacity-70 text-xs md:text-sm font-medium">Available Balance</p>
            <p className="text-base md:text-lg lg:text-xl font-bold text-[#0b2735] truncate mt-1">{formatCurrency(earnings.availableBalance)}</p>
          </div>
          <div className="bg-[#efb291] bg-opacity-10 rounded-xl p-3 md:p-4 lg:p-5 shadow-soft hover:shadow-medium transition-all">
            <p className="text-[#0b2735] text-opacity-70 text-xs md:text-sm font-medium">Pending Balance</p>
            <p className="text-base md:text-lg lg:text-xl font-bold text-[#0b2735] truncate mt-1">{formatCurrency(earnings.pendingBalance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  DollarSign, TrendingUp, Clock, CheckCircle, 
  ArrowRight, CreditCard, Wallet, PiggyBank 
} from 'lucide-react';

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentPayouts, setRecentPayouts] = useState([]);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [summaryRes, payoutsRes] = await Promise.all([
        vendorApi.getFinanceSummary(),
        vendorApi.getPayouts({ limit: 5 })
      ]);
      setSummary(summaryRes.data.data);
      setRecentPayouts(payoutsRes.data.data?.items || []);
    } catch (error) {
      console.error('Fetch financial data error:', error);
      toast.error('Failed to load financial data');
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

  const getPayoutStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" /> },
      PAID: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <Clock className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#efb291]"></div>
      </div>
    );
  }

  const earningCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(summary?.totalSales),
      description: 'Lifetime gross sales',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(summary?.totalEarnings),
      description: 'After platform commission',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Available Balance',
      value: formatCurrency(summary?.availableBalance),
      description: 'Ready to withdraw',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pending Balance',
      value: formatCurrency(summary?.pendingBalance),
      description: 'Awaiting order completion',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your revenue and earnings</p>
        </div>
        <Link
          to="/finance/withdrawals"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] transition-colors"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Request Withdrawal
        </Link>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {earningCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
                <p className="text-gray-500 text-sm mt-1">{card.description}</p>
              </div>
              <div className={`${card.bgLight} ${card.textColor} p-3 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commission Info */}
      <div className="bg-gradient-to-r from-[#0b2735] to-[#1a3d52] rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Commission Rate</h3>
            <p className="text-gray-300 mt-1">Platform commission on each sale</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#efb291]">{summary?.commissionRate || 10}%</p>
            <p className="text-gray-300 text-sm">You keep {100 - (summary?.commissionRate || 10)}%</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How Earnings Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-medium text-gray-800">Customer Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Customer places an order</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">2</span>
            </div>
            <h3 className="font-medium text-gray-800">Pending Balance</h3>
            <p className="text-sm text-gray-500 mt-1">Earnings go to pending</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h3 className="font-medium text-gray-800">Order Delivered</h3>
            <p className="text-sm text-gray-500 mt-1">Funds become available</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">4</span>
            </div>
            <h3 className="font-medium text-gray-800">Withdraw</h3>
            <p className="text-sm text-gray-500 mt-1">Request your payout</p>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Payouts</h2>
          <Link 
            to="/finance/withdrawals" 
            className="text-[#efb291] hover:underline text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {recentPayouts.length === 0 ? (
          <div className="text-center py-8">
            <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payout history yet</p>
            <Link 
              to="/finance/withdrawals" 
              className="inline-block mt-3 text-[#efb291] hover:underline"
            >
              Request your first withdrawal
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-500 py-3">Date</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-3">Amount</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-3">Method</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayouts.map((payout) => (
                  <tr key={payout._id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-700">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {payout.paymentMethodSnapshot?.type || 'Bank Transfer'}
                    </td>
                    <td className="py-3">
                      {getPayoutStatusBadge(payout.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;

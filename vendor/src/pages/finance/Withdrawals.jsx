import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  DollarSign, Clock, CheckCircle, XCircle, 
  CreditCard, Building, Wallet, AlertCircle, Loader 
} from 'lucide-react';

const Withdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, payoutsRes] = await Promise.all([
        vendorApi.getFinanceSummary(),
        vendorApi.getPayouts({ page: pagination.page, limit: 10 })
      ]);
      setSummary(summaryRes.data.data);
      setPayouts(payoutsRes.data.data?.items || []);
      setPagination({
        page: payoutsRes.data.data?.page || 1,
        pages: payoutsRes.data.data?.pages || 1,
        total: payoutsRes.data.data?.total || 0,
      });
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > (summary?.availableBalance || 0)) {
      toast.error('Amount exceeds available balance');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    try {
      setRequesting(true);
      await vendorApi.requestPayout({ amount });
      toast.success('Withdrawal request submitted successfully!');
      setShowRequestModal(false);
      setWithdrawAmount('');
      fetchData();
    } catch (error) {
      console.error('Request withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setRequesting(false);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />, label: 'Pending Review' },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Approved' },
      PAID: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Paid' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
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

  const hasPendingWithdrawal = payouts.some(p => p.status === 'PENDING');

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Withdrawals</h1>
          <p className="text-gray-600 mt-1">Request and track your payouts</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={hasPendingWithdrawal || (summary?.availableBalance || 0) < 10}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Request Withdrawal
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-[#0b2735] to-[#1a3d52] rounded-xl p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <Wallet className="w-5 h-5 text-[#efb291] mr-2" />
              <p className="text-gray-300 text-sm">Available Balance</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary?.availableBalance)}</p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-yellow-400 mr-2" />
              <p className="text-gray-300 text-sm">Pending Balance</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary?.pendingBalance)}</p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <CreditCard className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-gray-300 text-sm">Total Withdrawn</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary?.totalWithdrawn)}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {hasPendingWithdrawal && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
            <p className="text-yellow-700">
              You have a pending withdrawal request. Please wait for it to be processed before requesting another.
            </p>
          </div>
        </div>
      )}

      {(summary?.availableBalance || 0) < 10 && !hasPendingWithdrawal && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3" />
            <p className="text-blue-700">
              Minimum withdrawal amount is $10. Your current balance is {formatCurrency(summary?.availableBalance)}.
            </p>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Payout History</h2>
        </div>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
            <p className="text-gray-500">Your payout history will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(payout.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          {payout.paymentMethodSnapshot?.type || 'Bank Transfer'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payout.adminNote || '-'}
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
                    Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}
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

      {/* Request Withdrawal Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Withdrawal</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.availableBalance)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="10"
                  max={summary?.availableBalance || 0}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: $10</p>
            </div>

            <button
              onClick={() => setWithdrawAmount(summary?.availableBalance?.toString() || '0')}
              className="w-full mb-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Withdraw Full Balance
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setWithdrawAmount('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestWithdrawal}
                disabled={requesting}
                className="flex-1 px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 flex items-center justify-center"
              >
                {requesting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;

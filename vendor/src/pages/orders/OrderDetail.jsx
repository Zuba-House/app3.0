import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { vendorApi } from '../../utils/api';
import { 
  ArrowLeft, Package, MapPin, User, Phone, 
  Clock, CheckCircle, Truck, XCircle, AlertCircle, Save 
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getOrder(id);
      setOrder(response.data.data);
      setNewStatus(response.data.data.vendorSummary?.status || response.data.data.items?.[0]?.vendorStatus || 'RECEIVED');
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      await vendorApi.updateOrderStatus(id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });
      toast.success('Order status updated successfully');
      fetchOrderDetail();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      RECEIVED: <Clock className="w-5 h-5 text-gray-500" />,
      PROCESSING: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      SHIPPED: <Truck className="w-5 h-5 text-blue-500" />,
      OUT_FOR_DELIVERY: <Package className="w-5 h-5 text-indigo-500" />,
      DELIVERED: <CheckCircle className="w-5 h-5 text-green-500" />,
      CANCELLED: <XCircle className="w-5 h-5 text-red-500" />,
    };
    return icons[status] || icons.RECEIVED;
  };

  const statusOptions = [
    { value: 'RECEIVED', label: 'Received', description: 'Order has been received' },
    { value: 'PROCESSING', label: 'Processing', description: 'Preparing the order' },
    { value: 'SHIPPED', label: 'Shipped', description: 'Order has been shipped' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'On the way to customer' },
    { value: 'DELIVERED', label: 'Delivered', description: 'Successfully delivered' },
    { value: 'CANCELLED', label: 'Cancelled', description: 'Order was cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#efb291]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
      </div>
    );
  }

  const currentStatus = order.items?.[0]?.vendorStatus || 'RECEIVED';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
            
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="py-4 flex items-center">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.productId?.images?.[0] || item.image || '/placeholder-product.png'}
                      alt={item.productId?.name || item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.productId?.name || item.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × {formatCurrency(item.price || item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.subTotal || (item.quantity * (item.price || item.unitPrice)))}
                    </p>
                    {item.vendorEarning && (
                      <p className="text-xs text-green-600">
                        Your earning: {formatCurrency(item.vendorEarning)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.vendorTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-2">
                <span>Your Total Earnings</span>
                <span className="text-green-600">{formatCurrency(order.vendorTotal)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Order Status</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewStatus(option.value)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    newStatus === option.value
                      ? 'border-[#efb291] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {getStatusIcon(option.value)}
                    <span className="ml-2 text-sm font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>

            {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#efb291] focus:border-transparent"
                  placeholder="Enter tracking number"
                />
              </div>
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === currentStatus}
              className="flex items-center justify-center w-full px-4 py-2 bg-[#0b2735] text-white rounded-lg hover:bg-[#1a3d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h2>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              {getStatusIcon(currentStatus)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">{currentStatus?.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-500">
                  Last updated: {formatDate(order.updatedAt || order.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName || 'Guest Customer'}</p>
                </div>
              </div>

              {order.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-900">{order.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div className="text-sm text-gray-700">
                {order.shippingAddress ? (
                  <>
                    <p>{order.shippingAddress.address_line || order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.country} {order.shippingAddress.pincode || order.shippingAddress.postalCode}</p>
                  </>
                ) : (
                  <p className="text-gray-500">No shipping address provided</p>
                )}
              </div>
            </div>

            {order.deliveryNote && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Delivery Note:</p>
                <p className="text-sm text-yellow-700">{order.deliveryNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

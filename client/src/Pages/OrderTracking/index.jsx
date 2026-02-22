import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaTruck,
  FaBox,
  FaCheckCircle,
  FaClipboardCheck,
  FaShippingFast,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaBoxOpen,
  FaWarehouse,
  FaHeadset
} from "react-icons/fa";
import { fetchDataFromApi } from "../../utils/api";

const OrderTracking = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrderData(null);
    setSearched(true);

    try {
      const response = await fetchDataFromApi(
        `/api/orders/track/${orderId}?email=${encodeURIComponent(email)}`
      );

      if (response?.error === false && response?.success) {
        setOrderData(response);
      } else {
        setError(
          response?.message ||
            "Order not found. Please check your order ID and email address."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Order not found. Please check your order ID and email address."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClipboardCheck className="text-4xl text-yellow-500" />;
      case "processing":
        return <FaBox className="text-4xl text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-4xl text-purple-500" />;
      case "out_for_delivery":
        return <FaShippingFast className="text-4xl text-orange-500" />;
      case "delivered":
        return <FaCheckCircle className="text-4xl text-green-500" />;
      case "cancelled":
        return <FaExclamationTriangle className="text-4xl text-red-500" />;
      default:
        return <FaBox className="text-4xl text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Order Confirmed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "out_for_delivery":
        return "bg-orange-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const orderSteps = [
    { key: "pending", label: "Order Placed", icon: <FaClipboardCheck /> },
    { key: "processing", label: "Processing", icon: <FaWarehouse /> },
    { key: "shipped", label: "Shipped", icon: <FaTruck /> },
    { key: "out_for_delivery", label: "Out for Delivery", icon: <FaShippingFast /> },
    { key: "delivered", label: "Delivered", icon: <FaHome /> }
  ];

  const getCurrentStepIndex = (status) => {
    const index = orderSteps.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  return (
    <div className="order-tracking-page bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-[#0b2735] via-[#0f3547] to-[#0b2735] py-12 lg:py-20 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#efb291] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#efb291] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center max-w-4xl mx-auto" variants={fadeInUp}>
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaTruck className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">Real-Time Order Tracking</p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Track Your <span className="text-[#efb291]">Order</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Enter your order ID and email address to track your package in real-time
            </motion.p>

            {/* Search Form */}
            <motion.div className="max-w-3xl mx-auto" variants={fadeInUp}>
              <form
                onSubmit={handleTrackOrder}
                className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Order ID (e.g., 65a1b2c3d4e5f6g7h8i9j0k)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none text-[#0b2735] font-medium"
                    />
                  </div>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none text-[#0b2735] font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#efb291] text-[#0b2735] py-4 rounded-xl font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Track Order
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  You can find your order ID in the confirmation email we sent you
                </p>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Results Section */}
      <AnimatePresence>
        {searched && (
          <motion.section
            className="py-12 lg:py-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="container mx-auto px-4">
              {/* Error State */}
              {error && (
                <motion.div
                  className="max-w-3xl mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-700 mb-2">Order Not Found</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/faq"
                      className="border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all"
                    >
                      Visit FAQ
                    </Link>
                    <a
                      href="mailto:sales@zubahouse.com"
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      Contact Support
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Success State - Order Found */}
              {orderData && (
                <motion.div
                  className="max-w-6xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Order Status Header */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                        >
                          {getStatusIcon(orderData.status)}
                        </motion.div>
                        <div>
                          <h2 className="text-3xl font-bold text-[#0b2735] mb-2">
                            {getStatusText(orderData.status)}
                          </h2>
                          <p className="text-gray-600">Order ID: {orderData.orderId}</p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                        <p className="text-xl font-bold text-[#efb291] flex items-center gap-2 justify-center md:justify-end">
                          <FaCalendarAlt />
                          {orderData.estimatedDelivery}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {orderData.deliveryDays}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6">
                    <h3 className="text-2xl font-bold text-[#0b2735] mb-8 text-center">
                      Order Progress
                    </h3>
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 hidden lg:block">
                        <motion.div
                          className={`h-full ${getStatusColor(orderData.status)}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(getCurrentStepIndex(orderData.status) / (orderSteps.length - 1)) * 100}%`
                          }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 relative">
                        {orderSteps.map((step, index) => {
                          const isCompleted = getCurrentStepIndex(orderData.status) >= index;
                          const isCurrent = getCurrentStepIndex(orderData.status) === index;
                          return (
                            <motion.div
                              key={step.key}
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <motion.div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 text-2xl relative z-10 ${
                                  isCompleted
                                    ? getStatusColor(orderData.status) + " text-white"
                                    : "bg-gray-200 text-gray-400"
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: index * 0.1 }}
                              >
                                {step.icon}
                                {isCurrent && (
                                  <motion.div
                                    className="absolute -inset-2 border-4 border-[#efb291] rounded-full"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                  />
                                )}
                              </motion.div>
                              <p
                                className={`text-center text-sm font-semibold ${
                                  isCompleted ? "text-[#0b2735]" : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              {isCurrent && (
                                <motion.div
                                  className="mt-2 px-3 py-1 bg-[#efb291] text-[#0b2735] text-xs font-bold rounded-full"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  Current
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Information */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-[#0b2735] mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#efb291]" />
                        Shipping Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                          <p className="font-semibold text-[#0b2735]">
                            {orderData.shippingAddress.name}
                          </p>
                          <p className="text-gray-700">
                            {orderData.shippingAddress.street}
                          </p>
                          <p className="text-gray-700">
                            {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                            {orderData.shippingAddress.zipCode}
                          </p>
                          <p className="text-gray-700">{orderData.shippingAddress.country}</p>
                        </div>
                        {orderData.trackingNumber && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                            <p className="font-mono font-semibold text-[#efb291]">
                              {orderData.trackingNumber}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Shipping Method</p>
                          <p className="font-semibold text-[#0b2735]">
                            {orderData.shippingMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-[#0b2735] mb-6 flex items-center gap-2">
                        <FaBoxOpen className="text-[#efb291]" />
                        Order Summary
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Order Date</p>
                          <p className="font-semibold text-[#0b2735] flex items-center gap-2">
                            <FaCalendarAlt className="text-[#efb291]" />
                            {orderData.orderDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Items</p>
                          <p className="font-semibold text-[#0b2735]">
                            {orderData.items.length} item(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Order Total</p>
                          <p className="text-2xl font-bold text-[#efb291]">
                            ${orderData.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                          <p className="font-semibold text-[#0b2735]">
                            {orderData.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mt-6">
                    <h3 className="text-xl font-bold text-[#0b2735] mb-6 flex items-center gap-2">
                      <FaBox className="text-[#efb291]" />
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {orderData.items.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || "/placeholder-product.png"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0b2735] mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#efb291]">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking History Timeline */}
                  {orderData.trackingHistory && orderData.trackingHistory.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mt-6">
                      <h3 className="text-xl font-bold text-[#0b2735] mb-6 flex items-center gap-2">
                        <FaClock className="text-[#efb291]" />
                        Tracking History
                      </h3>
                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                        <div className="space-y-6">
                          {orderData.trackingHistory.map((event, index) => (
                            <motion.div
                              key={index}
                              className="relative pl-16"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-[#efb291] border-4 border-white shadow-md" />
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-semibold text-[#0b2735] mb-1">
                                  {event.status}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <FaCalendarAlt />
                                    {event.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaClock />
                                    {event.time}
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center gap-1">
                                      <FaMapMarkerAlt />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Need Help Section */}
                  <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-2xl p-6 lg:p-8 mt-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-[#e5e2db] mb-4">
                        Need Help with Your Order?
                      </h3>
                      <p className="text-[#e5e2db] opacity-90 mb-6">
                        Our customer support team is here to assist you
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                          href="mailto:sales@zubahouse.com"
                          className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all inline-flex items-center justify-center gap-2"
                        >
                          <FaEnvelope />
                          Email Support
                        </a>
                        <a
                          href="tel:+14375577487"
                          className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-lg font-semibold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-2"
                        >
                          <FaPhoneAlt />
                          Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Section */}
      {!searched && (
        <motion.section
          className="py-16 lg:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735] mb-4">
                Track Your Order <span className="text-[#efb291]">Anytime</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Stay updated with real-time tracking information on your order
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
                variants={fadeInUp}
              >
                <div className="bg-[#efb291] bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTruck className="text-4xl text-[#efb291]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Get live updates on your order status from warehouse to doorstep
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
                variants={fadeInUp}
              >
                <div className="bg-[#efb291] bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-4xl text-[#efb291]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-2">
                  Estimated Delivery
                </h3>
                <p className="text-gray-600">
                  Know exactly when to expect your package with accurate delivery estimates
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all"
                variants={fadeInUp}
              >
                <div className="bg-[#efb291] bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHeadset className="text-4xl text-[#efb291]" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Our customer support team is always ready to help with any questions
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default OrderTracking;


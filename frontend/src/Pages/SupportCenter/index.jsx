import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaHeadset,
  FaEnvelope,
  FaPhoneAlt,
  FaQuestionCircle,
  FaComments,
  FaClock,
  FaCheckCircle,
  FaPaperPlane,
  FaUser,
  FaMapMarkerAlt,
  FaGlobe,
  FaShoppingCart,
  FaTruck,
  FaCreditCard,
  FaUndo,
  FaShieldAlt,
  FaMobileAlt,
  FaLightbulb,
  FaSearch,
  FaArrowRight
} from "react-icons/fa";

const SupportCenter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    orderNumber: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const supportCategories = [
    {
      value: "order_inquiry",
      label: "Order Inquiry",
      icon: <FaShoppingCart className="text-2xl" />,
      description: "Questions about your order status or details"
    },
    {
      value: "shipping_delivery",
      label: "Shipping & Delivery",
      icon: <FaTruck className="text-2xl" />,
      description: "Tracking, delivery times, or shipping issues"
    },
    {
      value: "payment_billing",
      label: "Payment & Billing",
      icon: <FaCreditCard className="text-2xl" />,
      description: "Payment methods, refunds, or billing questions"
    },
    {
      value: "returns_exchanges",
      label: "Returns & Exchanges",
      icon: <FaUndo className="text-2xl" />,
      description: "Return policy or exchange requests"
    },
    {
      value: "product_inquiry",
      label: "Product Inquiry",
      icon: <FaQuestionCircle className="text-2xl" />,
      description: "Questions about specific products"
    },
    {
      value: "technical_support",
      label: "Technical Support",
      icon: <FaMobileAlt className="text-2xl" />,
      description: "Website or app technical issues"
    },
    {
      value: "account_help",
      label: "Account Help",
      icon: <FaUser className="text-2xl" />,
      description: "Account login or profile issues"
    },
    {
      value: "other",
      label: "Other",
      icon: <FaComments className="text-2xl" />,
      description: "General inquiries or feedback"
    }
  ];

  const quickHelpTopics = [
    {
      icon: <FaTruck className="text-3xl text-[#efb291]" />,
      title: "Track Your Order",
      description: "Get real-time updates on your package",
      link: "/order-tracking",
      color: "bg-blue-50"
    },
    {
      icon: <FaUndo className="text-3xl text-[#efb291]" />,
      title: "Return & Refund",
      description: "Learn about our return policy",
      link: "/return-refund-policy",
      color: "bg-green-50"
    },
    {
      icon: <FaShoppingCart className="text-3xl text-[#efb291]" />,
      title: "Shipping Information",
      description: "Delivery times and shipping rates",
      link: "/shipping-info",
      color: "bg-purple-50"
    },
    {
      icon: <FaQuestionCircle className="text-3xl text-[#efb291]" />,
      title: "Browse FAQ",
      description: "Find answers to common questions",
      link: "/faq",
      color: "bg-orange-50"
    }
  ];

  const contactMethods = [
    {
      icon: <FaEnvelope className="text-3xl text-[#efb291]" />,
      title: "Email Support",
      primary: "contact@zubahouse.com",
      secondary: "CC: info@zubahouse.com",
      description: "We respond within 24 hours",
      link: "mailto:contact@zubahouse.com?cc=info@zubahouse.com"
    },
    {
      icon: <FaPhoneAlt className="text-3xl text-[#efb291]" />,
      title: "Phone Support",
      primary: "+1 (437) 557-7487",
      secondary: "Sales: sales@zubahouse.com",
      description: "Mon-Fri, 9 AM - 6 PM EST",
      link: "tel:+14375577487"
    },
    {
      icon: <FaMobileAlt className="text-3xl text-[#efb291]" />,
      title: "Mobile App",
      primary: "In-App Chat Support",
      secondary: "Download our app",
      description: "Fastest response time",
      link: "/download-app"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const categoryLabel = supportCategories.find(
      (cat) => cat.value === formData.category
    )?.label || formData.category;

    // Prepare email body
    const emailBody = `
New Support Request from Zuba House Website

Customer Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Category: ${categoryLabel}
${formData.orderNumber ? `- Order Number: ${formData.orderNumber}` : ""}

Subject: ${formData.subject}

Message:
${formData.message}

---
Submitted: ${new Date().toLocaleString()}
Support Request ID: SR-${Date.now()}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:contact@zubahouse.com?cc=info@zubahouse.com&subject=${encodeURIComponent(
      `Support Request: ${formData.subject || categoryLabel}`
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div
          className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center border-2 border-[#efb291]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <FaCheckCircle className="text-5xl text-green-500" />
          </motion.div>

          <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735] mb-4">
            Message Sent Successfully!
          </h2>

          <p className="text-gray-600 text-lg mb-6">
            Your email client should open automatically. If it doesn&apos;t, please email us directly at{" "}
            <a
              href="mailto:contact@zubahouse.com?cc=info@zubahouse.com"
              className="text-[#efb291] font-semibold underline hover:text-[#e5a67d]"
            >
              contact@zubahouse.com
            </a>
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
              <FaClock className="text-blue-500" />
              What Happens Next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-blue-500 flex-shrink-0 mt-1" />
                <span>Our support team will review your message within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-blue-500 flex-shrink-0 mt-1" />
                <span>You&apos;ll receive a response at {formData.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-blue-500 flex-shrink-0 mt-1" />
                <span>Check your spam folder if you don&apos;t see our reply</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-blue-500 flex-shrink-0 mt-1" />
                <span>
                  For urgent matters, call us at{" "}
                  <a href="tel:+14375577487" className="text-blue-600 underline">
                    +1 (437) 557-7487
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  subject: "",
                  category: "",
                  orderNumber: "",
                  message: ""
                });
              }}
              className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-xl font-semibold hover:bg-[#e5a67d] transition-all"
            >
              Send Another Message
            </button>
            <Link
              to="/"
              className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-xl font-semibold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-block"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="support-center-page bg-white">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-[#0b2735] via-[#0f3547] to-[#0b2735] py-16 lg:py-24 relative overflow-hidden"
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
              <FaHeadset className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">We&apos;re Here to Help</p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Support Center <span className="text-[#efb291]">& FAQ</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Have a question or need assistance? Our dedicated support team is ready to help 
              you with any inquiries about orders, shipping, returns, or products.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 text-[#e5e2db] text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <FaClock className="text-[#efb291]" />
                <span>24-Hour Response Time</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Expert Support Team</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-[#efb291]" />
                <span>Available Worldwide</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Help Topics */}
      <motion.section
        className="py-12 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0b2735] mb-2">
              Quick Help Topics
            </h2>
            <p className="text-gray-600">Find instant answers to common questions</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickHelpTopics.map((topic, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Link
                  to={topic.link}
                  className={`block ${topic.color} rounded-2xl p-6 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-[#efb291] group h-full`}
                >
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                    {topic.icon}
                  </div>
                  <h3 className="font-bold text-[#0b2735] mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                  <div className="flex items-center justify-center gap-2 text-[#efb291] font-semibold text-sm">
                    <span>Learn More</span>
                    <FaArrowRight />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Contact Section */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div className="lg:col-span-2" variants={fadeInUp}>
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-gray-200">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-[#efb291] w-12 h-12 rounded-full flex items-center justify-center">
                    <FaComments className="text-2xl text-[#0b2735]" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#0b2735]">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-gray-500">We&apos;ll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      What can we help you with? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {supportCategories.map((category) => (
                        <label
                          key={category.value}
                          className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.category === category.value
                              ? "border-[#efb291] bg-[#efb291] bg-opacity-10"
                              : "border-gray-200 hover:border-[#efb291] hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={formData.category === category.value}
                            onChange={handleInputChange}
                            required
                            className="sr-only"
                          />
                          <div
                            className={`flex-shrink-0 ${
                              formData.category === category.value
                                ? "text-[#efb291]"
                                : "text-gray-400"
                            }`}
                          >
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0b2735] text-sm mb-1">
                              {category.label}
                            </p>
                            <p className="text-xs text-gray-600">{category.description}</p>
                          </div>
                          {formData.category === category.value && (
                            <FaCheckCircle className="text-[#efb291] absolute top-3 right-3" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  {/* Order Number (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Number (If Applicable)
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                      placeholder="e.g., ORD-123456"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all resize-none"
                      placeholder="Please provide as much detail as possible so we can assist you better..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#efb291] text-[#0b2735] py-5 rounded-xl font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0b2735]" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    By submitting this form, you&apos;ll be directed to your email client to send your message
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Sidebar - Contact Methods & FAQ */}
            <motion.div className="lg:col-span-1 space-y-6" variants={fadeInUp}>
              {/* FAQ Highlight Card */}
              <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl p-6 text-[#e5e2db]">
                <div className="bg-[#efb291] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaQuestionCircle className="text-3xl text-[#0b2735]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  Browse Our FAQ
                </h3>
                <p className="text-sm opacity-90 mb-6 text-center">
                  Find instant answers to the most common questions about orders, 
                  shipping, returns, and more.
                </p>
                <Link
                  to="/faq"
                  className="block w-full bg-[#efb291] text-[#0b2735] py-4 rounded-xl font-bold text-center hover:bg-[#e5a67d] transition-all"
                >
                  View All FAQs
                </Link>
              </div>

              {/* Contact Methods */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-[#0b2735] mb-6 flex items-center gap-2">
                  <FaHeadset className="text-[#efb291]" />
                  Other Ways to Reach Us
                </h3>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">{method.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#0b2735] text-sm mb-1">
                            {method.title}
                          </h4>
                          {method.link.startsWith("mailto:") || method.link.startsWith("tel:") ? (
                            <a
                              href={method.link}
                              className="text-[#efb291] hover:text-[#e5a67d] text-sm font-semibold block mb-1"
                            >
                              {method.primary}
                            </a>
                          ) : (
                            <Link
                              to={method.link}
                              className="text-[#efb291] hover:text-[#e5a67d] text-sm font-semibold block mb-1"
                            >
                              {method.primary}
                            </Link>
                          )}
                          <p className="text-xs text-gray-600 mb-1">{method.secondary}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaClock className="text-2xl text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-900">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span className="font-semibold">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Saturday:</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <p className="text-xs mt-3 pt-3 border-t border-blue-300">
                    Email support available 24/7. We respond within 24 hours.
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaMapMarkerAlt className="text-2xl text-[#efb291]" />
                  <h3 className="text-lg font-bold text-[#0b2735]">Our Location</h3>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold">Zuba House Headquarters</p>
                  <p>119 Chem Rivermead</p>
                  <p>Gatineau, QC J9H 5W5</p>
                  <p>Canada</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Tips Section */}
      <motion.section
        className="py-16 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735] mb-4">
              Getting the <span className="text-[#efb291]">Best Support</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Help us help you faster with these tips
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:border-[#efb291] transition-all text-center"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingCart className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="font-bold text-[#0b2735] mb-2">Include Order Number</h3>
              <p className="text-sm text-gray-600">
                Having your order number helps us locate your information quickly
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:border-[#efb291] transition-all text-center"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLightbulb className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="font-bold text-[#0b2735] mb-2">Be Specific</h3>
              <p className="text-sm text-gray-600">
                Provide detailed information about your issue for faster resolution
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:border-[#efb291] transition-all text-center"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="font-bold text-[#0b2735] mb-2">Check FAQ First</h3>
              <p className="text-sm text-gray-600">
                Many common questions are already answered in our FAQ section
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:border-[#efb291] transition-all text-center"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="font-bold text-[#0b2735] mb-2">Keep It Secure</h3>
              <p className="text-sm text-gray-600">
                Never share passwords or full payment details via email
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default SupportCenter;


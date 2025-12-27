import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaEnvelope,
  FaPhoneAlt,
  FaUserShield,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaBoxOpen,
  FaCommentDots,
  FaImage,
  FaPaperPlane,
  FaInfoCircle,
  FaHeadset,
  FaBell,
  FaExclamationCircle
} from "react-icons/fa";

const ReportSuspiciousActivity = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    activityType: "",
    orderId: "",
    description: "",
    evidenceFiles: []
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

  const activityTypes = [
    {
      value: "fraudulent_seller",
      label: "Fraudulent Seller",
      icon: <FaUserShield className="text-2xl" />,
      description: "Fake stores, unauthorized sellers, or identity theft"
    },
    {
      value: "counterfeit_products",
      label: "Counterfeit Products",
      icon: <FaBoxOpen className="text-2xl" />,
      description: "Fake, imitation, or misrepresented products"
    },
    {
      value: "payment_fraud",
      label: "Payment Fraud",
      icon: <FaCreditCard className="text-2xl" />,
      description: "Unauthorized charges, phishing, or payment scams"
    },
    {
      value: "phishing_scam",
      label: "Phishing/Scam",
      icon: <FaExclamationTriangle className="text-2xl" />,
      description: "Suspicious emails, messages, or fake websites"
    },
    {
      value: "account_compromise",
      label: "Account Compromise",
      icon: <FaLock className="text-2xl" />,
      description: "Hacked accounts or unauthorized access"
    },
    {
      value: "other",
      label: "Other Suspicious Activity",
      icon: <FaExclamationCircle className="text-2xl" />,
      description: "Any other security concerns"
    }
  ];

  const securityTips = [
    {
      icon: <FaLock className="text-3xl text-[#efb291]" />,
      title: "Protect Your Password",
      description: "Never share your password with anyone. Zuba House will never ask for your password via email or phone."
    },
    {
      icon: <FaCreditCard className="text-3xl text-[#efb291]" />,
      title: "Verify Payment Requests",
      description: "Only make payments through our official website or app. Be cautious of payment requests via email or text."
    },
    {
      icon: <FaEnvelope className="text-3xl text-[#efb291]" />,
      title: "Check Email Authenticity",
      description: "Verify emails are from @zubahouse.com. Look for spelling errors or suspicious links in emails."
    },
    {
      icon: <FaUserShield className="text-3xl text-[#efb291]" />,
      title: "Report Immediately",
      description: "If you notice any suspicious activity, report it immediately to help protect yourself and others."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      evidenceFiles: files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare email body
    const emailBody = `
New Suspicious Activity Report

Reporter Information:
- Name: ${formData.reporterName}
- Email: ${formData.reporterEmail}
- Phone: ${formData.reporterPhone || "Not provided"}

Activity Details:
- Type: ${activityTypes.find(type => type.value === formData.activityType)?.label || formData.activityType}
- Order ID: ${formData.orderId || "Not applicable"}

Description:
${formData.description}

---
This report was submitted via the Zuba House website.
Time: ${new Date().toLocaleString()}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:suspicious@zubahouse.com?subject=${encodeURIComponent(
      `Suspicious Activity Report - ${activityTypes.find(type => type.value === formData.activityType)?.label || "Security Concern"}`
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Simulate submission delay
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
            Thank You for Your Report
          </h2>

          <p className="text-gray-600 text-lg mb-6">
            Your email client should open automatically. If it doesn&apos;t, please email us directly at{" "}
            <a
              href="mailto:suspicious@zubahouse.com"
              className="text-[#efb291] font-semibold underline hover:text-[#e5a67d]"
            >
              suspicious@zubahouse.com
            </a>
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <FaInfoCircle className="text-blue-500 text-2xl flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">What Happens Next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Our security team will review your report within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>We may contact you for additional information if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Appropriate action will be taken to address the concern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your information will be kept confidential</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  reporterName: "",
                  reporterEmail: "",
                  reporterPhone: "",
                  activityType: "",
                  orderId: "",
                  description: "",
                  evidenceFiles: []
                });
              }}
              className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-xl font-semibold hover:bg-[#e5a67d] transition-all"
            >
              Submit Another Report
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
    <div className="report-suspicious-activity-page bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-[#0b2735] via-[#0f3547] to-[#0b2735] py-12 lg:py-20 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#efb291] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center max-w-4xl mx-auto" variants={fadeInUp}>
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-red-500 bg-opacity-20 border border-red-400 rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaShieldAlt className="text-red-400" />
              <p className="text-red-400 text-sm font-medium">Security Alert Center</p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Report <span className="text-red-400">Suspicious Activity</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Help us keep Zuba House safe and secure. If you&apos;ve encountered fraudulent activity, 
              phishing attempts, or any security concerns, please report it immediately.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 text-[#e5e2db] text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Confidential Reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>24-48 Hour Response</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Secure Investigation</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Warning Banner */}
      <motion.section
        className="py-8 bg-red-50 border-t-4 border-red-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex items-start gap-4">
            <FaExclamationTriangle className="text-red-500 text-3xl flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Immediate Action Required?
              </h3>
              <p className="text-red-800 mb-4">
                If you believe your account has been compromised or you&apos;re experiencing an ongoing 
                security threat, please contact our emergency security hotline immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+14375577487"
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
                >
                  <FaPhoneAlt />
                  Call Emergency Line: +1 (437) 557-7487
                </a>
                <a
                  href="mailto:suspicious@zubahouse.com"
                  className="inline-flex items-center gap-2 border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all"
                >
                  <FaEnvelope />
                  Email: suspicious@zubahouse.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Form Section */}
      <motion.section
        className="py-16 lg:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Report Form */}
            <motion.div className="lg:col-span-2" variants={fadeInUp}>
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-gray-200">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="text-2xl text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#0b2735]">
                      Submit Your Report
                    </h2>
                    <p className="text-sm text-gray-500">All fields marked with * are required</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Reporter Information */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-[#0b2735] mb-4 flex items-center gap-2">
                      <FaUserShield className="text-[#efb291]" />
                      Your Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="reporterName"
                          value={formData.reporterName}
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
                          name="reporterEmail"
                          value={formData.reporterEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          name="reporterPhone"
                          value={formData.reporterPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Activity Type Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-[#0b2735] mb-4 flex items-center gap-2">
                      <FaExclamationTriangle className="text-[#efb291]" />
                      Type of Suspicious Activity *
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activityTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.activityType === type.value
                              ? "border-[#efb291] bg-[#efb291] bg-opacity-10"
                              : "border-gray-200 hover:border-[#efb291] hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="activityType"
                            value={type.value}
                            checked={formData.activityType === type.value}
                            onChange={handleInputChange}
                            required
                            className="sr-only"
                          />
                          <div
                            className={`flex-shrink-0 ${
                              formData.activityType === type.value
                                ? "text-[#efb291]"
                                : "text-gray-400"
                            }`}
                          >
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#0b2735] text-sm">
                              {type.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {type.description}
                            </p>
                          </div>
                          {formData.activityType === type.value && (
                            <FaCheckCircle className="text-[#efb291] absolute top-4 right-4" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Order ID (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Related Order ID (If Applicable)
                    </label>
                    <input
                      type="text"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all"
                      placeholder="e.g., ORD-123456"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      If this report relates to a specific order, please provide the order ID
                    </p>
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#efb291] focus:outline-none transition-all resize-none"
                      placeholder="Please provide as much detail as possible about the suspicious activity, including dates, times, URLs, usernames, or any other relevant information..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The more details you provide, the better we can investigate and take action
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Evidence/Screenshots (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#efb291] transition-all">
                      <FaImage className="text-4xl text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        id="evidence-upload"
                      />
                      <label
                        htmlFor="evidence-upload"
                        className="cursor-pointer text-[#efb291] font-semibold hover:text-[#e5a67d]"
                      >
                        Click to upload files
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, PDF up to 10MB each
                      </p>
                      {formData.evidenceFiles.length > 0 && (
                        <div className="mt-4 text-left">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Selected files:
                          </p>
                          <ul className="space-y-1">
                            {formData.evidenceFiles.map((file, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-blue-500 text-xl flex-shrink-0 mt-1" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-2">Your Privacy is Protected</p>
                        <p>
                          All reports are treated confidentially. Your information will only be 
                          used for investigation purposes and will not be shared with third parties 
                          without your consent, except as required by law.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Submit Report
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    By submitting this report, you confirm that the information provided is accurate 
                    to the best of your knowledge
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Sidebar - Security Tips */}
            <motion.div className="lg:col-span-1 space-y-6" variants={fadeInUp}>
              {/* Contact Info Card */}
              <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl p-6 text-[#e5e2db]">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FaHeadset className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:suspicious@zubahouse.com"
                    className="flex items-center gap-3 text-sm hover:text-[#efb291] transition-all"
                  >
                    <FaEnvelope className="text-[#efb291]" />
                    suspicious@zubahouse.com
                  </a>
                  <a
                    href="tel:+14375577487"
                    className="flex items-center gap-3 text-sm hover:text-[#efb291] transition-all"
                  >
                    <FaPhoneAlt className="text-[#efb291]" />
                    +1 (437) 557-7487
                  </a>
                </div>
                <div className="mt-6 pt-6 border-t border-[rgba(229,226,219,0.2)]">
                  <p className="text-xs opacity-75">
                    Our security team is available 24/7 to assist with urgent matters
                  </p>
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <FaBell className="text-2xl text-[#efb291]" />
                  <h3 className="text-xl font-bold text-[#0b2735]">Security Tips</h3>
                </div>
                <div className="space-y-4">
                  {securityTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0">{tip.icon}</div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0b2735] mb-1">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Scams Alert */}
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  Common Scams to Watch For
                </h3>
                <ul className="space-y-3 text-sm text-red-800">
                  <li className="flex items-start gap-2">
                    <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <span>Fake customer service numbers or emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <span>Requests for payment outside our platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <span>Suspicious links in emails or messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <span>Too-good-to-be-true deals or offers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <span>Requests for personal or banking information</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Additional Resources */}
      <motion.section
        className="py-16 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735] mb-4">
              Additional <span className="text-[#efb291]">Resources</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn more about staying safe while shopping online
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="text-lg font-bold text-[#0b2735] mb-2">
                Security Center
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn about our security measures and best practices
              </p>
              <Link
                to="/faq"
                className="text-[#efb291] font-semibold hover:text-[#e5a67d] text-sm"
              >
                Visit Security Center
              </Link>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCommentDots className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="text-lg font-bold text-[#0b2735] mb-2">FAQ</h3>
              <p className="text-sm text-gray-600 mb-4">
                Find answers to common security questions
              </p>
              <Link
                to="/faq"
                className="text-[#efb291] font-semibold hover:text-[#e5a67d] text-sm"
              >
                View FAQs
              </Link>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              variants={fadeInUp}
            >
              <div className="bg-[#efb291] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="text-3xl text-[#efb291]" />
              </div>
              <h3 className="text-lg font-bold text-[#0b2735] mb-2">
                Contact Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get help from our customer support team
              </p>
              <a
                href="mailto:sales@zubahouse.com"
                className="text-[#efb291] font-semibold hover:text-[#e5a67d] text-sm"
              >
                Contact Us
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ReportSuspiciousActivity;


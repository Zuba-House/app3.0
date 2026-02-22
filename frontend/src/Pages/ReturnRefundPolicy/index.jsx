import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaUndo,
  FaBoxOpen,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShippingFast,
  FaCreditCard,
  FaClipboardList,
  FaQuestionCircle
} from "react-icons/fa";

const ReturnRefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const returnSteps = [
    {
      step: "1",
      title: "Contact Us",
      description: "Email sales@zubahouse.com within 30 days of receiving your order with your order number and reason for return.",
      icon: <FaEnvelope className="text-[30px] text-[#efb291]" />
    },
    {
      step: "2",
      title: "Get Authorization",
      description: "Our team will review your request and provide a Return Authorization (RA) number and instructions within 24-48 hours.",
      icon: <FaClipboardList className="text-[30px] text-[#efb291]" />
    },
    {
      step: "3",
      title: "Pack Your Item",
      description: "Securely pack the defective product in its original packaging with all accessories, manuals, and the RA number clearly visible.",
      icon: <FaBoxOpen className="text-[30px] text-[#efb291]" />
    },
    {
      step: "4",
      title: "Ship to Warehouse",
      description: "Send the package to our warehouse address. You are responsible for return shipping costs unless the item is defective.",
      icon: <FaShippingFast className="text-[30px] text-[#efb291]" />
    },
    {
      step: "5",
      title: "Receive Refund",
      description: "Once we receive and inspect your return, we'll process your refund within 5-7 business days to your original payment method.",
      icon: <FaCreditCard className="text-[30px] text-[#efb291]" />
    }
  ];

  const eligibleReturns = [
    "Defective or damaged products upon arrival",
    "Items that do not match the product description",
    "Wrong items shipped",
    "Products with manufacturing defects",
    "Items received in non-working condition"
  ];

  const nonEligibleReturns = [
    "Items beyond the 30-day return window",
    "Products without original packaging",
    "Used or worn items (unless defective)",
    "Personalized or custom-made products",
    "Items damaged due to misuse or neglect",
    "Products without Return Authorization number"
  ];

  const keyPolicies = [
    {
      icon: <FaCalendarAlt />,
      title: "30-Day Window",
      description: "Returns must be initiated within 30 days of delivery"
    },
    {
      icon: <FaClock />,
      title: "5-7 Days Processing",
      description: "Refunds processed within 5-7 business days after inspection"
    },
    {
      icon: <FaBoxOpen />,
      title: "Original Packaging",
      description: "Items must be returned in original condition with packaging"
    },
    {
      icon: <FaShippingFast />,
      title: "Return Shipping",
      description: "Customer covers return shipping (free if item is defective)"
    }
  ];

  return (
    <div className="return-refund-policy bg-white">
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
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaUndo className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Your Satisfaction is Our Priority
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Return & <span className="text-[#efb291]">Refund Policy</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              We want you to be completely satisfied with your purchase. If you&apos;re not happy with
              your order, we&apos;re here to help with our hassle-free return and refund process.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="#return-process"
                className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all shadow-lg hover:shadow-xl inline-block"
              >
                View Return Process
              </a>
              <a
                href="mailto:sales@zubahouse.com"
                className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-lg font-semibold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-block"
              >
                Contact Support
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Key Policy Highlights */}
      <motion.section
        className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold text-center mb-12 text-[#0b2735]"
            variants={fadeInUp}
          >
            Policy <span className="text-[#efb291]">Highlights</span>
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
          >
            {keyPolicies.map((policy, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:border-[#efb291] group"
                variants={fadeInUp}
              >
                <div className="text-[#0b2735] text-3xl mb-3 group-hover:text-[#efb291] transition-colors flex justify-center">
                  {policy.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{policy.title}</h3>
                <p className="text-[#0b2735] text-sm">{policy.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Return Process Section */}
      <motion.section
        id="return-process"
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              How to <span className="text-[#efb291]">Return Your Item</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Follow these simple steps to initiate your return and receive your refund
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {returnSteps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col md:flex-row gap-6 mb-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:border-[#efb291] transition-all"
                variants={fadeInUp}
              >
                <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-32 flex-shrink-0">
                  <div className="bg-[#efb291] text-[#0b2735] rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="hidden md:flex justify-center mt-2">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl lg:text-2xl font-bold text-[#0b2735] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Warehouse Address Section */}
      <motion.section
        className="py-12 lg:py-16 bg-[#0b2735]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-[rgba(239,178,145,0.1)] border-2 border-[#efb291] rounded-2xl p-8 lg:p-12"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#efb291] text-[#0b2735] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#efb291] mb-2">
                    Return Shipping Address
                  </h2>
                  <p className="text-[#e5e2db] text-sm opacity-90">
                    Ship all returns to our warehouse
                  </p>
                </div>
              </div>

              <div className="bg-[rgba(239,178,145,0.15)] border border-[#efb291] rounded-xl p-6 lg:p-8 text-[#e5e2db]">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-lg lg:text-xl font-bold text-[#efb291]">Zuba House Returns Department</p>
                  <p className="text-base lg:text-lg">119 Chem Rivermead</p>
                  <p className="text-base lg:text-lg">Gatineau, QC J9H 5W5</p>
                  <p className="text-base lg:text-lg font-semibold">Canada</p>
                </div>

                <div className="mt-6 pt-6 border-t border-[rgba(239,178,145,0.3)]">
                  <p className="text-sm opacity-90">
                    <strong className="text-[#efb291]">Important:</strong> Please ensure your Return Authorization (RA) number
                    is clearly written on the outside of the package. Packages without an RA number may be refused or delayed.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:sales@zubahouse.com?subject=Return%20Request"
                  className="flex items-center justify-center gap-2 bg-[#efb291] text-[#0b2735] px-6 py-3 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all"
                >
                  <FaEnvelope />
                  Email: sales@zubahouse.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Eligible vs Non-Eligible Returns */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Return <span className="text-[#efb291]">Eligibility</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Understanding what items can and cannot be returned
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Eligible Returns */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-6">
                <FaCheckCircle className="text-[#efb291] text-3xl" />
                <h3 className="text-2xl font-bold text-[#0b2735]">Eligible for Return</h3>
              </div>
              <ul className="space-y-4">
                {eligibleReturns.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Non-Eligible Returns */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-3 mb-6">
                <FaTimesCircle className="text-red-500 text-3xl" />
                <h3 className="text-2xl font-bold text-[#0b2735]">Not Eligible for Return</h3>
              </div>
              <ul className="space-y-4">
                {nonEligibleReturns.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Refund Information */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            variants={fadeInUp}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
                Refund <span className="text-[#efb291]">Information</span>
              </h2>
            </div>

            <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl p-8 lg:p-12 text-[#e5e2db]">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaCreditCard className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Refund Method</h4>
                    <p className="opacity-90">
                      Refunds will be issued to your original payment method (credit card, PayPal, etc.).
                      We cannot issue refunds to a different payment method.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaClock className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Processing Time</h4>
                    <p className="opacity-90">
                      Once we receive and inspect your return, refunds are processed within 5-7 business days.
                      Please allow an additional 3-5 business days for the refund to appear in your account,
                      depending on your bank or payment provider.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaShippingFast className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Shipping Costs</h4>
                    <p className="opacity-90">
                      Original shipping costs are non-refundable unless the return is due to our error
                      (defective product, wrong item shipped, etc.). Return shipping costs are the responsibility
                      of the customer unless the item is defective or incorrect.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaUndo className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Partial Refunds</h4>
                    <p className="opacity-90">
                      In some cases, partial refunds may be granted for items that are returned in less than
                      perfect condition, items not in original packaging, or items with missing accessories.
                      Our team will notify you before processing a partial refund.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaBoxOpen className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Exchanges</h4>
                    <p className="opacity-90">
                      We do not offer direct exchanges. If you need a different item, please return the original
                      item for a refund and place a new order for the replacement product.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Important Notes */}
      <motion.section
        className="py-12 lg:py-16 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-[rgba(239,178,145,0.1)] border-2 border-[#efb291] rounded-2xl p-8 lg:p-12"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#efb291] text-[#0b2735] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#efb291] mb-2">
                    Important Notes
                  </h2>
                  <p className="text-[#e5e2db] text-sm opacity-90">
                    Please read these carefully before initiating a return
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-[#e5e2db]">
                <p className="text-base leading-relaxed">
                  <strong className="text-[#efb291]">Inspection Required:</strong> All returned items
                  are subject to inspection. Items that do not meet our return criteria may be sent back
                  to you at your expense.
                </p>

                <p className="text-base leading-relaxed">
                  <strong className="text-[#efb291]">Defective Products:</strong> If you receive a
                  defective product, please contact us immediately with photos or videos of the defect.
                  We will cover return shipping costs for verified defective items.
                </p>

                <p className="text-base leading-relaxed">
                  <strong className="text-[#efb291]">International Returns:</strong> For international
                  orders, customers are responsible for all customs, duties, and taxes associated with
                  the return shipment.
                </p>

                <p className="text-base leading-relaxed">
                  <strong className="text-[#efb291]">Lost Returns:</strong> We recommend using a
                  trackable shipping service and purchasing shipping insurance for your return. Zuba House
                  is not responsible for returns lost in transit.
                </p>

                <div className="mt-6 pt-6 border-t border-[rgba(239,178,145,0.3)]">
                  <p className="text-sm italic opacity-75">
                    This policy may be updated from time to time. Please check this page regularly for
                    the most current version. Last updated: January 2025
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Frequently Asked <span className="text-[#efb291]">Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4">
                <FaQuestionCircle className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg text-[#0b2735] mb-2">
                    How long do I have to return an item?
                  </h4>
                  <p className="text-gray-600">
                    You have 30 days from the date of delivery to initiate a return. Returns requested
                    after 30 days will not be accepted.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4">
                <FaQuestionCircle className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg text-[#0b2735] mb-2">
                    Who pays for return shipping?
                  </h4>
                  <p className="text-gray-600">
                    Customers are responsible for return shipping costs unless the item is defective or
                    we shipped the wrong product. In those cases, we will provide a prepaid return label.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4">
                <FaQuestionCircle className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg text-[#0b2735] mb-2">
                    Can I exchange an item instead of returning it?
                  </h4>
                  <p className="text-gray-600">
                    We do not offer direct exchanges. Please return the item for a refund and place a
                    new order for the product you want.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4">
                <FaQuestionCircle className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg text-[#0b2735] mb-2">
                    What if I lost my order confirmation?
                  </h4>
                  <p className="text-gray-600">
                    No problem! Contact us at sales@zubahouse.com with your name and the email address
                    you used for the order, and we&apos;ll help you locate your order information.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 lg:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-6"
              variants={fadeInUp}
            >
              Need Help with a <span className="text-[#efb291]">Return?</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Our customer service team is here to assist you with any questions or concerns
              about your return or refund.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="mailto:sales@zubahouse.com?subject=Return%20Request"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3 group"
              >
                <FaEnvelope className="group-hover:scale-110 transition-transform" />
                Email Support
              </a>
              <Link
                to="/help-center"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                Visit Help Center
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              variants={fadeInUp}
            >
              <p className="text-gray-600 text-sm">
                Questions? Email us at <a href="mailto:sales@zubahouse.com" className="text-[#efb291] underline hover:text-[#e5a67d]">sales@zubahouse.com</a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ReturnRefundPolicy;


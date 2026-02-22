import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaTruck,
  FaShippingFast,
  FaGlobe,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaDollarSign,
  FaCheckCircle,
  FaPlane,
  FaShip,
  FaExclamationTriangle,
  FaCalculator,
  FaClipboardCheck,
  FaWarehouse,
  FaHome
} from "react-icons/fa";

const ShippingInfo = () => {
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

  const shippingMethods = [
    {
      icon: <FaShippingFast className="text-5xl text-[#efb291]" />,
      name: "Express Shipping",
      deliveryTime: "3-5 Business Days",
      price: "$29.99",
      features: [
        "Priority processing",
        "Expedited delivery",
        "Real-time tracking",
        "Insurance included",
        "Signature required"
      ],
      bestFor: "Urgent orders"
    },
    {
      icon: <FaTruck className="text-5xl text-[#efb291]" />,
      name: "Standard Shipping",
      deliveryTime: "7-10 Business Days",
      price: "$9.99",
      popular: true,
      features: [
        "Standard processing",
        "Regular delivery",
        "Real-time tracking",
        "Basic insurance",
        "Reliable service"
      ],
      bestFor: "Most orders"
    },
    {
      icon: <FaShip className="text-5xl text-[#efb291]" />,
      name: "Economy Shipping",
      deliveryTime: "10-14 Business Days",
      price: "Free over $100",
      features: [
        "Standard processing",
        "Economical delivery",
        "Basic tracking",
        "No rush",
        "Cost-effective"
      ],
      bestFor: "Budget-conscious shoppers"
    }
  ];

  const deliveryRegions = [
    {
      region: "North America",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["United States", "Canada", "Mexico"],
      deliveryTime: "3-7 Business Days",
      details: "Express and Standard shipping available. Free shipping on orders over $100."
    },
    {
      region: "Europe",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Others"],
      deliveryTime: "5-10 Business Days",
      details: "Multiple shipping options available. Customs clearance may add 1-2 days."
    },
    {
      region: "Asia-Pacific",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["Australia", "Japan", "Singapore", "South Korea", "New Zealand", "Others"],
      deliveryTime: "7-12 Business Days",
      details: "International shipping via air freight. Track your package in real-time."
    },
    {
      region: "Middle East & Africa",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["UAE", "Saudi Arabia", "South Africa", "Kenya", "Nigeria", "Others"],
      deliveryTime: "8-14 Business Days",
      details: "Standard international shipping. Additional customs processing time may apply."
    },
    {
      region: "South America",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru", "Others"],
      deliveryTime: "10-14 Business Days",
      details: "International shipping with tracking. Customs duties may apply."
    },
    {
      region: "Central America & Caribbean",
      icon: <FaMapMarkerAlt className="text-3xl text-[#efb291]" />,
      countries: ["Jamaica", "Trinidad", "Costa Rica", "Panama", "Others"],
      deliveryTime: "8-12 Business Days",
      details: "Standard international delivery. Island locations may require additional time."
    }
  ];

  const shippingProcess = [
    {
      step: "1",
      title: "Order Placed",
      description: "Your order is confirmed and sent to our warehouse for processing",
      icon: <FaClipboardCheck className="text-3xl text-[#efb291]" />,
      time: "Immediate"
    },
    {
      step: "2",
      title: "Processing",
      description: "We carefully pick, pack, and prepare your items for shipment",
      icon: <FaWarehouse className="text-3xl text-[#efb291]" />,
      time: "1-2 Business Days"
    },
    {
      step: "3",
      title: "Shipped",
      description: "Your package is handed to the carrier and begins its journey",
      icon: <FaTruck className="text-3xl text-[#efb291]" />,
      time: "Same Day"
    },
    {
      step: "4",
      title: "In Transit",
      description: "Your package is on the way to your destination",
      icon: <FaPlane className="text-3xl text-[#efb291]" />,
      time: "3-14 Business Days"
    },
    {
      step: "5",
      title: "Delivered",
      description: "Your package arrives at your doorstep",
      icon: <FaHome className="text-3xl text-[#efb291]" />,
      time: "Final Step"
    }
  ];

  const shippingFAQs = [
    {
      question: "How is shipping time calculated?",
      answer: "Shipping time is calculated in business days (Monday-Friday, excluding holidays) from the day your order is shipped, not from the order date. Processing time (1-2 business days) is separate from delivery time."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes! We ship to over 50 countries worldwide. Delivery times vary by location, ranging from 3 business days (North America Express) to 14 business days (international economy). Check our delivery regions section for specific timeframes."
    },
    {
      question: "What factors affect delivery time?",
      answer: "Delivery time depends on: shipping method selected, destination location, customs clearance (international), weather conditions, carrier delays, and peak seasons (holidays). Remote or rural areas may require additional 1-3 business days."
    },
    {
      question: "Can I track my shipment?",
      answer: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can track your package in real-time using our Order Tracking page or directly through the carrier's website."
    },
    {
      question: "What if my package is delayed?",
      answer: "If your package hasn't arrived within the estimated timeframe, please contact our customer support team at sales@zubahouse.com with your order number. We'll investigate with the carrier and provide assistance."
    }
  ];

  const keyFeatures = [
    {
      icon: <FaGlobe />,
      title: "Worldwide Shipping",
      description: "We deliver to 50+ countries"
    },
    {
      icon: <FaDollarSign />,
      title: "Free Shipping",
      description: "On orders over $100"
    },
    {
      icon: <FaClock />,
      title: "Fast Processing",
      description: "Orders ship within 1-2 days"
    },
    {
      icon: <FaCheckCircle />,
      title: "Tracking Included",
      description: "Track every step of delivery"
    }
  ];

  return (
    <div className="shipping-info-page bg-white">
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
              <FaTruck className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Global Delivery Network
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Shipping <span className="text-[#efb291]">Information</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              We deliver authentic African products to customers worldwide. Learn about our 
              shipping methods, delivery timeframes, and international coverage.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="#shipping-methods"
                className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all shadow-lg hover:shadow-xl inline-block"
              >
                View Shipping Methods
              </a>
              <Link
                to="/order-tracking"
                className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-lg font-semibold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-block"
              >
                Track My Order
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Key Features */}
      <motion.section
        className="py-12 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:border-[#efb291]"
                variants={fadeInUp}
              >
                <div className="text-[#0b2735] text-3xl mb-3 flex justify-center hover:text-[#efb291] transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{feature.title}</h3>
                <p className="text-[#0b2735] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Shipping Methods */}
      <motion.section
        id="shipping-methods"
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Shipping <span className="text-[#efb291]">Methods</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Choose the shipping method that best fits your needs and timeline
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {shippingMethods.map((method, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all hover:shadow-2xl ${
                  method.popular
                    ? "border-[#efb291] relative"
                    : "border-gray-200 hover:border-[#efb291]"
                }`}
                variants={fadeInUp}
              >
                {method.popular && (
                  <div className="bg-[#efb291] text-[#0b2735] text-center py-2 font-bold text-sm">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <div className="flex justify-center mb-6">{method.icon}</div>
                  <h3 className="text-2xl font-bold text-[#0b2735] mb-2 text-center">
                    {method.name}
                  </h3>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 text-[#efb291] mb-2">
                      <FaClock />
                      <span className="font-semibold">{method.deliveryTime}</span>
                    </div>
                    <p className="text-3xl font-bold text-[#efb291]">{method.price}</p>
                    {method.price.includes("Free") && (
                      <p className="text-sm text-gray-500">or $9.99 under $100</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 text-center">
                      <strong>Best for:</strong> {method.bestFor}
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {method.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Delivery Regions */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Delivery <span className="text-[#efb291]">Timeframes by Region</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Estimated delivery times vary by destination. All timeframes are in business days 
              (Monday-Friday, excluding holidays)
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {deliveryRegions.map((region, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-[#efb291]"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-4 mb-4">
                  {region.icon}
                  <h3 className="text-xl font-bold text-[#0b2735]">{region.region}</h3>
                </div>
                <div className="bg-[#efb291] bg-opacity-10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-[#efb291] font-bold">
                    <FaCalendarAlt />
                    <span>{region.deliveryTime}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Countries include:</p>
                  <div className="flex flex-wrap gap-2">
                    {region.countries.map((country, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{region.details}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 bg-[#0b2735] rounded-2xl p-8 max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <div className="flex items-start gap-4 text-[#e5e2db]">
              <FaExclamationTriangle className="text-[#efb291] text-2xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-2">Important Note on Delivery Times</h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  Delivery timeframes are estimates based on typical shipping conditions. Actual 
                  delivery times may vary due to customs clearance, weather conditions, carrier delays, 
                  remote locations, or peak seasons. Rural and island areas may require an additional 
                  1-3 business days. We&apos;ll provide tracking information so you can monitor your shipment 
                  in real-time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Shipping Process */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Shipping <span className="text-[#efb291]">Process</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Here&apos;s how your order travels from our warehouse to your doorstep
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gray-200">
                <div className="h-full bg-gradient-to-r from-[#0b2735] via-[#efb291] to-[#0b2735] w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative">
                {shippingProcess.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center text-center"
                    variants={fadeInUp}
                  >
                    <motion.div
                      className="w-32 h-32 rounded-full bg-white border-4 border-[#efb291] flex items-center justify-center mb-4 shadow-lg relative z-10"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-center">
                        {step.icon}
                        <div className="text-2xl font-bold text-[#0b2735] mt-2">
                          {step.step}
                        </div>
                      </div>
                    </motion.div>

                    <h3 className="text-lg font-bold text-[#0b2735] mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    <div className="bg-[#efb291] bg-opacity-10 px-4 py-2 rounded-full">
                      <p className="text-xs font-semibold text-[#efb291]">{step.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Shipping Calculator CTA */}
      <motion.section
        className="py-12 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-[#efb291] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalculator className="text-4xl text-[#0b2735]" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-[#e5e2db] mb-4">
              Calculate Your Shipping Cost
            </h3>
            <p className="text-[#e5e2db] opacity-90 mb-8 max-w-2xl mx-auto">
              Get an instant shipping quote based on your location and order details. 
              Shipping costs are calculated at checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3"
              >
                <FaBoxOpen />
                Start Shopping
              </Link>
              <Link
                to="/order-tracking"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                <FaTruck />
                Track My Order
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Shipping <span className="text-[#efb291]">FAQs</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Common questions about our shipping policies and procedures
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {shippingFAQs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-[#efb291] transition-all"
                variants={fadeInUp}
              >
                <h4 className="font-bold text-lg text-[#0b2735] mb-3 flex items-start gap-3">
                  <FaCheckCircle className="text-[#efb291] flex-shrink-0 mt-1" />
                  {faq.question}
                </h4>
                <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact CTA */}
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
              Have More <span className="text-[#efb291]">Questions?</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Our customer support team is here to help with any shipping-related questions 
              or concerns you may have.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="mailto:sales@zubahouse.com"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3"
              >
                Contact Support
              </a>
              <Link
                to="/faq"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                Visit FAQ
              </Link>
            </motion.div>

            <motion.div className="mt-12 pt-8 border-t border-gray-200" variants={fadeInUp}>
              <p className="text-gray-600 text-sm">
                Email: <a href="mailto:sales@zubahouse.com" className="text-[#efb291] underline hover:text-[#e5a67d]">sales@zubahouse.com</a> | 
                Phone: <a href="tel:+14375577487" className="text-[#efb291] underline hover:text-[#e5a67d]">+1 (437) 557-7487</a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ShippingInfo;


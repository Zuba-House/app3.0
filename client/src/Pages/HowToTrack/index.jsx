import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaShippingFast, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaBell,
  FaSearch,
  FaBox,
  FaTruck,
  FaHome,
  FaCheckCircle,
  FaClock,
  FaMobileAlt,
  FaDesktop,
  FaInfoCircle,
  FaPhone,
  FaQuestionCircle
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const HowToTrack = () => {
  const [activeMethod, setActiveMethod] = useState('website');

  const trackingMethods = [
    {
      id: 'website',
      icon: <FaDesktop />,
      title: "Track on Website",
      steps: [
        {
          number: "1",
          title: "Visit Tracking Page",
          description: "Go to zubahouse.com/track-order or click 'Track Order' in the main menu",
          icon: <FaSearch />
        },
        {
          number: "2",
          title: "Enter Order Details",
          description: "Input your Order ID (found in confirmation email) and registered email address",
          icon: <FaBox />
        },
        {
          number: "3",
          title: "View Live Status",
          description: "See real-time updates, estimated delivery, and complete shipping timeline",
          icon: <FaMapMarkerAlt />
        },
        {
          number: "4",
          title: "Get Notifications",
          description: "Opt-in for email/SMS alerts at each shipping milestone",
          icon: <FaBell />
        }
      ]
    },
    {
      id: 'app',
      icon: <FaMobileAlt />,
      title: "Track on Mobile App",
      steps: [
        {
          number: "1",
          title: "Open Zuba House App",
          description: "Launch the app and log into your account",
          icon: <FaMobileAlt />
        },
        {
          number: "2",
          title: "Go to My Orders",
          description: "Tap the menu icon and select 'My Orders' from the navigation",
          icon: <FaBox />
        },
        {
          number: "3",
          title: "Select Your Order",
          description: "Choose the order you want to track from your order history",
          icon: <FaSearch />
        },
        {
          number: "4",
          title: "View Live Map",
          description: "See your package location on an interactive map with ETA updates",
          icon: <FaMapMarkerAlt />
        }
      ]
    },
    {
      id: 'email',
      icon: <FaEnvelope />,
      title: "Track via Email",
      steps: [
        {
          number: "1",
          title: "Check Confirmation Email",
          description: "Find your order confirmation email sent immediately after purchase",
          icon: <FaEnvelope />
        },
        {
          number: "2",
          title: "Click Tracking Link",
          description: "Click the 'Track Your Order' button in the shipping notification email",
          icon: <FaShippingFast />
        },
        {
          number: "3",
          title: "Automatic Updates",
          description: "Receive email notifications at: Processing, Shipped, Out for Delivery, Delivered",
          icon: <FaBell />
        },
        {
          number: "4",
          title: "Direct Access",
          description: "Each email contains a unique tracking link for instant status check",
          icon: <FaCheckCircle />
        }
      ]
    }
  ];

  const orderStatuses = [
    {
      status: "Order Placed",
      icon: <FaCheckCircle />,
      color: "#efb291",
      description: "Your order has been confirmed and payment processed successfully",
      duration: "Instant",
      actions: ["View order details", "Download invoice", "Contact support if needed"]
    },
    {
      status: "Processing",
      icon: <FaBox />,
      color: "#efb291",
      description: "Your order is being prepared and packaged at our warehouse",
      duration: "1-2 business days",
      actions: ["Cancel order (within 1 hour)", "Modify shipping address", "Add gift message"]
    },
    {
      status: "Shipped",
      icon: <FaTruck />,
      color: "#efb291",
      description: "Your package has left our warehouse and is on its way to you",
      duration: "In transit",
      actions: ["Track live location", "Estimate delivery date", "Request delivery instructions"]
    },
    {
      status: "Out for Delivery",
      icon: <FaShippingFast />,
      color: "#efb291",
      description: "Your package is with the local courier and will arrive today",
      duration: "Today",
      actions: ["See driver location", "Provide delivery notes", "Reschedule if needed"]
    },
    {
      status: "Delivered",
      icon: <FaHome />,
      color: "#4ade80",
      description: "Your order has been successfully delivered to the specified address",
      duration: "Completed",
      actions: ["Confirm receipt", "Leave product review", "Report any issues"]
    }
  ];

  const deliveryTimeframes = [
    { region: "North America (USA, Canada)", time: "3-7 business days", method: "Express/Standard" },
    { region: "Europe (UK, Germany, France)", time: "5-10 business days", method: "Standard" },
    { region: "Africa (Rwanda, Kenya, Nigeria)", time: "3-5 business days", method: "Regional Express" },
    { region: "Asia (UAE, India, China)", time: "7-12 business days", method: "International" },
    { region: "Australia & New Zealand", time: "10-14 business days", method: "Standard" },
    { region: "Latin America", time: "10-14 business days", method: "Economy" }
  ];

  const troubleshootingTips = [
    {
      issue: "Tracking number not working",
      solution: "Wait 24-48 hours after shipping notification. It takes time for carriers to update their systems.",
      icon: <FaClock />
    },
    {
      issue: "No updates for several days",
      solution: "This is normal during customs clearance or remote area transit. Contact support if over 7 days.",
      icon: <FaInfoCircle />
    },
    {
      issue: "Package shows delivered but not received",
      solution: "Check with neighbors, building reception, or safe locations. Contact us within 48 hours.",
      icon: <FaMapMarkerAlt />
    },
    {
      issue: "Delivery delayed beyond estimate",
      solution: "Weather, customs, or carrier delays may occur. We'll extend any guarantees automatically.",
      icon: <FaShippingFast />
    }
  ];

  const faqs = [
    {
      question: "How long does it take to get a tracking number?",
      answer: "You'll receive your tracking number via email within 1-2 business days after your order is processed and shipped from our warehouse."
    },
    {
      question: "Can I track my order without an account?",
      answer: "Yes! Simply visit our Track Order page and enter your Order ID and email address. No account login required."
    },
    {
      question: "What if my tracking shows an incorrect delivery address?",
      answer: "Contact us immediately at contact@zubahouse.com or +1 (437) 557-7487. We can redirect packages if they haven't reached the local courier yet."
    },
    {
      question: "Do you provide real-time GPS tracking?",
      answer: "Yes! Our mobile app offers real-time GPS tracking once your package is out for delivery in supported regions."
    },
    {
      question: "How are delivery delays handled?",
      answer: "We proactively notify you of any delays. If delivery exceeds our estimated timeframe by more than 5 days, contact support for resolution options."
    }
  ];

  return (
    <>
      <Helmet>
        <title>How to Track Your Order - Zuba House Real-Time Tracking Guide</title>
        <meta name="description" content="Track your Zuba House order in real-time. Learn how to monitor your package from warehouse to doorstep using our website, mobile app, or email notifications. Get delivery updates, estimated arrival times, and tracking tips." />
        <meta name="keywords" content="track Zuba House order, order tracking, package tracking, delivery status, shipping updates, real-time tracking, track my package" />
        <link rel="canonical" href="https://zubahouse.com/how-to-track" />
        <meta property="og:title" content="How to Track Your Zuba House Order - Complete Tracking Guide" />
        <meta property="og:description" content="Monitor your package every step of the way with Zuba House's comprehensive tracking system. Get real-time updates, delivery estimates, and support." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://zubahouse.com/how-to-track" />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#0b2735' }}>
        {/* Hero Section */}
        <motion.div 
          className="relative py-20 px-6"
          style={{ background: 'linear-gradient(135deg, #0b2735 0%, #1a3d52 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-6 py-2 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', border: '1px solid #efb291' }}
            >
              <FaShippingFast className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Real-Time Order Tracking</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              How to Track Your Order
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 leading-relaxed"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Monitor your package journey from our warehouse to your doorstep with real-time updates, 
              estimated delivery times, and complete transparency every step of the way.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                to="/order-tracking" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                <FaSearch className="inline mr-2" />
                Track Order Now
              </Link>
              <Link 
                to="/shipping-info" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
              >
                Shipping Information
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Tracking Methods Tabs */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Three Ways to Track Your Order
            </h2>

            {/* Method Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {trackingMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveMethod(method.id)}
                  className="flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: activeMethod === method.id ? '#efb291' : 'transparent',
                    color: activeMethod === method.id ? '#0b2735' : '#e5e2db',
                    border: `2px solid ${activeMethod === method.id ? '#efb291' : 'rgba(239, 178, 145, 0.3)'}`
                  }}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="font-semibold">{method.title}</span>
                </button>
              ))}
            </div>

            {/* Active Method Steps */}
            {trackingMethods.map((method) => (
              activeMethod === method.id && (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {method.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="p-6 rounded-xl"
                      style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ borderColor: '#efb291', y: -5 }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                          style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                        >
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl" style={{ color: '#efb291' }}>{step.icon}</span>
                            <h3 className="text-xl font-bold" style={{ color: '#e5e2db' }}>
                              {step.title}
                            </h3>
                          </div>
                          <p style={{ color: '#e5e2db', opacity: 0.85 }}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Understanding Order Status
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Your order progresses through these stages from confirmation to delivery
            </p>

            <div className="space-y-6">
              {orderStatuses.map((status, index) => (
                <motion.div
                  key={index}
                  className="relative p-8 rounded-2xl"
                  style={{ backgroundColor: '#0b2735', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: status.color, scale: 1.02 }}
                >
                  {/* Status Header */}
                  <div className="flex items-start gap-6 mb-4">
                    <div 
                      className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: status.color, color: '#0b2735' }}
                    >
                      {status.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                          {status.status}
                        </h3>
                        <span 
                          className="px-4 py-1 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: status.color }}
                        >
                          {status.duration}
                        </span>
                      </div>
                      <p className="text-lg mb-4" style={{ color: '#e5e2db', opacity: 0.85 }}>
                        {status.description}
                      </p>

                      {/* Available Actions */}
                      <div className="flex flex-wrap gap-2">
                        {status.actions.map((action, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', color: '#efb291' }}
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < orderStatuses.length - 1 && (
                    <div 
                      className="absolute left-14 bottom-0 w-0.5 h-6 translate-y-full"
                      style={{ backgroundColor: 'rgba(239, 178, 145, 0.3)' }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Timeframes */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Estimated Delivery Times by Region
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Typical delivery timeframes after shipment (processing time: 1-2 business days)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryTimeframes.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291', y: -5 }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <FaMapMarkerAlt className="text-2xl flex-shrink-0 mt-1" style={{ color: '#efb291' }} />
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#e5e2db' }}>
                        {item.region}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold" style={{ color: '#efb291' }}>
                          {item.time}
                        </p>
                        <p className="text-sm" style={{ color: '#e5e2db', opacity: 0.7 }}>
                          via {item.method}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div 
              className="mt-8 p-6 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', border: '1px solid #efb291' }}
            >
              <FaInfoCircle className="inline text-2xl mb-2" style={{ color: '#efb291' }} />
              <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                Delivery times may vary due to customs clearance, holidays, or remote locations. 
                We&apos;ll notify you of any significant delays immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Tracking Troubleshooting
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {troubleshootingTips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291' }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0" style={{ color: '#efb291' }}>
                      {tip.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#efb291' }}>
                        {tip.issue}
                      </h3>
                      <p style={{ color: '#e5e2db', opacity: 0.85 }}>
                        {tip.solution}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Tracking FAQs
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291' }}
                >
                  <div className="flex items-start gap-4">
                    <FaQuestionCircle className="flex-shrink-0 text-xl mt-1" style={{ color: '#efb291' }} />
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#e5e2db' }}>
                        {faq.question}
                      </h3>
                      <p style={{ color: '#e5e2db', opacity: 0.8 }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="p-12 rounded-3xl text-center"
              style={{ background: 'linear-gradient(135deg, #efb291 0%, #d4a077 100%)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#0b2735' }}>
                Need Tracking Help?
              </h2>
              <p className="text-xl mb-8" style={{ color: '#0b2735', opacity: 0.8 }}>
                Our support team is here to help with any tracking or delivery questions
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="mailto:contact@zubahouse.com"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#0b2735', color: '#e5e2db' }}
                >
                  <FaEnvelope className="inline mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+14375577487"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#0b2735', border: '2px solid #0b2735' }}
                >
                  <FaPhone className="inline mr-2" />
                  Call Us
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowToTrack;


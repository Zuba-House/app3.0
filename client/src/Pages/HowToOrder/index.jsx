import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUserPlus, 
  FaSearch, 
  FaCreditCard, 
  FaCheckCircle,
  FaMobileAlt,
  FaDesktop,
  FaStore,
  FaHeart,
  FaFilter,
  FaLock,
  FaTag,
  FaShippingFast,
  FaQuestionCircle
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const HowToOrder = () => {
  const [activeStep, setActiveStep] = useState(null);

  const orderingSteps = [
    {
      id: 1,
      icon: <FaUserPlus />,
      title: "Step 1: Create Your Account",
      duration: "2 minutes",
      content: {
        description: "Start your Zuba House journey by creating a free account. This allows you to track orders, save favorites, and enjoy personalized recommendations.",
        methods: [
          {
            title: "On Website",
            steps: [
              "Click 'Sign Up' in the top-right corner",
              "Enter your email address and create a strong password",
              "Verify your email through the confirmation link",
              "Complete your profile with shipping information"
            ]
          },
          {
            title: "On Mobile App",
            steps: [
              "Download Zuba House app from App Store or Google Play",
              "Tap 'Create Account' on the welcome screen",
              "Sign up using email, Google, or Apple ID",
              "Enable notifications for exclusive app-only deals"
            ]
          }
        ],
        proTip: "Use the mobile app to get exclusive 15% off your first order with code APP15!"
      }
    },
    {
      id: 2,
      icon: <FaSearch />,
      title: "Step 2: Browse & Find Products",
      duration: "5-10 minutes",
      content: {
        description: "Discover authentic African fashion, art, and home décor from over 360 trusted sellers across 8 countries.",
        methods: [
          {
            title: "Search Methods",
            steps: [
              "Use the search bar for specific items (e.g., 'Ankara dresses')",
              "Browse by category: Clothing, Footwear, Art, Home Décor",
              "Filter by price, size, color, material, and seller location",
              "Check 'New Arrivals' and 'Trending Now' sections"
            ]
          },
          {
            title: "Product Page Features",
            steps: [
              "View high-quality images from multiple angles",
              "Read detailed descriptions and material information",
              "Check size charts and fitting guides",
              "Read verified customer reviews and ratings",
              "See estimated delivery time (3-14 business days)"
            ]
          }
        ],
        proTip: "Add items to your Wishlist (heart icon) to save them for later and get price drop alerts!"
      }
    },
    {
      id: 3,
      icon: <FaShoppingCart />,
      title: "Step 3: Add to Cart & Review",
      duration: "3 minutes",
      content: {
        description: "Select your desired products, customize options, and prepare your order for checkout.",
        methods: [
          {
            title: "Adding Items",
            steps: [
              "Select size, color, and quantity on product page",
              "Click 'Add to Cart' button",
              "Continue shopping or proceed to cart",
              "Review all items in your shopping cart"
            ]
          },
          {
            title: "Cart Management",
            steps: [
              "Update quantities or remove unwanted items",
              "Check if you qualify for free shipping (orders over $100)",
              "View subtotal and estimated shipping costs",
              "Apply promo codes in the 'Promo Code' field"
            ]
          }
        ],
        proTip: "Bundle multiple items to reach $100 for FREE Economy Shipping worldwide!"
      }
    },
    {
      id: 4,
      icon: <FaCreditCard />,
      title: "Step 4: Checkout & Payment",
      duration: "3-5 minutes",
      content: {
        description: "Complete your purchase securely using multiple payment options with bank-level encryption.",
        methods: [
          {
            title: "Shipping Information",
            steps: [
              "Confirm or enter your delivery address",
              "Choose shipping method (Express, Standard, or Economy)",
              "Add special delivery instructions if needed",
              "Review estimated delivery date"
            ]
          },
          {
            title: "Payment Options",
            steps: [
              "Credit/Debit Cards (Visa, Mastercard, Amex)",
              "PayPal for buyer protection",
              "Digital wallets (Apple Pay, Google Pay)",
              "Buy Now, Pay Later options (Klarna, Afterpay)"
            ]
          }
        ],
        proTip: "All transactions are secured with SSL encryption and PCI DSS compliance!"
      }
    },
    {
      id: 5,
      icon: <FaCheckCircle />,
      title: "Step 5: Order Confirmation & Tracking",
      duration: "Instant",
      content: {
        description: "Receive immediate confirmation and track your order from warehouse to doorstep.",
        methods: [
          {
            title: "After Purchase",
            steps: [
              "Receive order confirmation email instantly",
              "Get order number and estimated delivery date",
              "Access order details in 'My Account' > 'Orders'",
              "Receive shipping notification with tracking number"
            ]
          },
          {
            title: "Track Your Order",
            steps: [
              "Visit 'Track Order' page and enter order ID",
              "Monitor real-time status updates",
              "Receive email/SMS notifications at each milestone",
              "Contact support if delivery exceeds estimated time"
            ]
          }
        ],
        proTip: "Enable push notifications in the app for real-time delivery updates!"
      }
    }
  ];

  const quickTips = [
    {
      icon: <FaMobileAlt />,
      title: "Order via Mobile App",
      description: "Get exclusive deals and faster checkout",
      benefit: "Save 15% on first app order"
    },
    {
      icon: <FaTag />,
      title: "Use Promo Codes",
      description: "Apply codes at checkout for instant savings",
      benefit: "Up to 40% off on selected items"
    },
    {
      icon: <FaShippingFast />,
      title: "Free Shipping",
      description: "Orders over $100 ship free worldwide",
      benefit: "Save up to $29.99 on shipping"
    },
    {
      icon: <FaHeart />,
      title: "Create Wishlist",
      description: "Save favorites and get price alerts",
      benefit: "Never miss a deal"
    }
  ];

  const faqs = [
    {
      question: "Do I need to create an account to order?",
      answer: "Yes, you need to create an account to place an order. Creating an account allows you to track orders, save addresses, and access exclusive member benefits. Registration is quick and easy."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, PayPal, Apple Pay, Google Pay, and Buy Now Pay Later services like Klarna and Afterpay."
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "You can modify or cancel orders within 1 hour of placing them. Contact us immediately at contact@zubahouse.com if you need to make changes."
    },
    {
      question: "How do I apply a promo code?",
      answer: "In your cart, find the 'Promo Code' field, enter your code, and click 'Apply'. The discount will reflect in your total before checkout."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes! We ship to over 50 countries worldwide. Delivery times range from 3-14 business days depending on your location and chosen shipping method."
    }
  ];

  return (
    <>
      <Helmet>
        <title>How to Order on Zuba House - Complete Step-by-Step Guide</title>
        <meta name="description" content="Learn how to order authentic African fashion, art, and home décor on Zuba House. Follow our easy 5-step guide from browsing to checkout. Get exclusive tips, promo codes, and shipping info." />
        <meta name="keywords" content="how to order Zuba House, online shopping guide, African fashion shopping, buy African products online, Zuba House tutorial, order placement guide" />
        <link rel="canonical" href="https://zubahouse.com/how-to-order" />
        <meta property="og:title" content="How to Order on Zuba House - Complete Shopping Guide" />
        <meta property="og:description" content="Step-by-step guide to ordering authentic African products on Zuba House. Learn browsing, checkout, payment options, and exclusive shopping tips." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://zubahouse.com/how-to-order" />
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
              <span style={{ color: '#efb291' }} className="font-semibold">Complete Shopping Guide</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              How to Order on Zuba House
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 leading-relaxed"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your complete guide to discovering and purchasing authentic African fashion, 
              art, and home décor from 360+ verified sellers across 8 countries.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                to="/products" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                Start Shopping Now
              </Link>
              <Link 
                to="/download-app" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
              >
                <FaMobileAlt className="inline mr-2" />
                Download App
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Tips Banner */}
        <div className="py-12 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#e5e2db' }}>
              Quick Shopping Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickTips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, borderColor: '#efb291' }}
                >
                  <div className="text-4xl mb-4" style={{ color: '#efb291' }}>
                    {tip.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#e5e2db' }}>
                    {tip.title}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {tip.description}
                  </p>
                  <span className="text-xs font-semibold" style={{ color: '#efb291' }}>
                    {tip.benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Steps Section */}
        <div className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                5 Simple Steps to Your Perfect Order
              </h2>
              <p className="text-lg" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Follow this comprehensive guide to make your first purchase on Zuba House
              </p>
            </motion.div>

            {/* Steps Timeline */}
            <div className="space-y-8">
              {orderingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div 
                    className="p-8 rounded-2xl cursor-pointer transition-all duration-300"
                    style={{ 
                      backgroundColor: activeStep === step.id ? 'rgba(239, 178, 145, 0.1)' : '#1a3d52',
                      border: `2px solid ${activeStep === step.id ? '#efb291' : 'rgba(239, 178, 145, 0.2)'}`,
                    }}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  >
                    {/* Step Header */}
                    <div className="flex items-start gap-6 mb-6">
                      <div 
                        className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                      >
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                            {step.title}
                          </h3>
                          <span 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                          >
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed" style={{ color: '#e5e2db', opacity: 0.8 }}>
                          {step.content.description}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {activeStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-6"
                      >
                        {step.content.methods.map((method, idx) => (
                          <div key={idx} className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(11, 39, 53, 0.5)' }}>
                            <h4 className="text-xl font-bold mb-4" style={{ color: '#efb291' }}>
                              {method.title}
                            </h4>
                            <ul className="space-y-3">
                              {method.steps.map((stepItem, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <FaCheckCircle className="flex-shrink-0 mt-1" style={{ color: '#efb291' }} />
                                  <span style={{ color: '#e5e2db', opacity: 0.9 }}>{stepItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {/* Pro Tip */}
                        <div 
                          className="p-6 rounded-xl flex items-start gap-4"
                          style={{ backgroundColor: 'rgba(239, 178, 145, 0.15)', border: '1px solid #efb291' }}
                        >
                          <FaLock className="text-2xl flex-shrink-0" style={{ color: '#efb291' }} />
                          <div>
                            <h5 className="font-bold mb-2" style={{ color: '#efb291' }}>Pro Tip</h5>
                            <p style={{ color: '#e5e2db', opacity: 0.9 }}>{step.content.proTip}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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

        {/* Final CTA Section */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6" style={{ color: '#e5e2db' }}>
                Ready to Start Shopping?
              </h2>
              <p className="text-xl mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Join 360+ happy customers shopping authentic African products
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  to="/products" 
                  className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                  style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                >
                  Browse Collections
                </Link>
                <Link 
                  to="/faq" 
                  className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
                >
                  More Questions?
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowToOrder;


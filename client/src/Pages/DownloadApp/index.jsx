import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaMobileAlt,
  FaBell,
  FaTags,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaCheckCircle,
  FaStar,
  FaApple,
  FaGooglePlay,
  FaQrcode,
  FaGift,
  FaLock,
  FaSync,
  FaUserCircle,
  FaSearch,
  FaCreditCard,
  FaTruck,
  FaChartLine,
  FaUsers,
  FaAward
} from "react-icons/fa";

const DownloadApp = () => {
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

  const appBenefits = [
    {
      icon: <FaTags className="text-4xl text-[#efb291]" />,
      title: "Exclusive App-Only Discounts",
      description: "Get access to special deals and promotions available only on the mobile app. Save more on every purchase!"
    },
    {
      icon: <FaBell className="text-4xl text-[#efb291]" />,
      title: "Price Drop Alerts",
      description: "Get instant notifications when items on your wishlist go on sale. Never miss a great deal again!"
    },
    {
      icon: <FaBolt className="text-4xl text-[#efb291]" />,
      title: "Lightning Fast Checkout",
      description: "Shop faster with saved payment methods and one-tap checkout. Complete your purchase in seconds!"
    },
    {
      icon: <FaTruck className="text-4xl text-[#efb291]" />,
      title: "Real-Time Order Tracking",
      description: "Track your orders with push notifications at every step. Know exactly when your package will arrive!"
    },
    {
      icon: <FaHeart className="text-4xl text-[#efb291]" />,
      title: "Smart Wishlist",
      description: "Save your favorite items and get notified about restocks, price changes, and special offers on products you love!"
    },
    {
      icon: <FaGift className="text-4xl text-[#efb291]" />,
      title: "Early Access to Sales",
      description: "Be the first to shop new collections and flash sales before they're available on the website!"
    },
    {
      icon: <FaSearch className="text-4xl text-[#efb291]" />,
      title: "Advanced Search & Filters",
      description: "Find exactly what you're looking for with powerful search tools and smart product recommendations!"
    },
    {
      icon: <FaLock className="text-4xl text-[#efb291]" />,
      title: "Secure & Safe",
      description: "Shop with confidence using biometric authentication and secure payment processing. Your data is protected!"
    },
    {
      icon: <FaSync className="text-4xl text-[#efb291]" />,
      title: "Seamless Sync",
      description: "Your cart, wishlist, and order history sync automatically across all your devices. Shop anywhere, anytime!"
    }
  ];

  const appFeatures = [
    {
      icon: <FaUserCircle />,
      title: "Personalized Experience",
      description: "Customized recommendations based on your preferences"
    },
    {
      icon: <FaCreditCard />,
      title: "Multiple Payment Options",
      description: "Credit cards, debit cards, PayPal, and more"
    },
    {
      icon: <FaStar />,
      title: "Easy Reviews",
      description: "Rate and review products with photos"
    },
    {
      icon: <FaShoppingCart />,
      title: "Smart Cart",
      description: "Save items for later and manage your cart easily"
    }
  ];

  const stats = [
    { icon: <FaUsers />, number: "360+", label: "Happy Users" },
    { icon: <FaStar />, number: "4.8", label: "App Rating" },
    { icon: <FaChartLine />, number: "95%", label: "Satisfaction Rate" },
    { icon: <FaAward />, number: "100+", label: "5-Star Reviews" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "The app is so much faster than the website! I love getting notifications about deals and my orders. Highly recommend!",
      location: "Toronto, Canada"
    },
    {
      name: "James K.",
      rating: 5,
      text: "Best shopping app I've used! The exclusive discounts are amazing and checkout is super quick. Worth downloading!",
      location: "New York, USA"
    },
    {
      name: "Amara N.",
      rating: 5,
      text: "I love supporting African artisans and this app makes it so easy. The wishlist alerts saved me so much money!",
      location: "London, UK"
    }
  ];

  return (
    <div className="download-app-page bg-white">
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#efb291] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center max-w-5xl mx-auto" variants={fadeInUp}>
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaMobileAlt className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Available on iOS & Android
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-7xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Shop Smarter with the{" "}
              <span className="text-[#efb291]">Zuba House App</span>
            </motion.h1>

            <motion.p
              className="text-lg lg:text-2xl text-[#e5e2db] mb-8 opacity-90 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Discover exclusive deals, faster checkout, and personalized shopping experience. 
              Download now and save more on authentic African products!
            </motion.p>

            {/* App Store Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              variants={fadeInUp}
            >
              <a
                href="https://apps.apple.com/us/app/zuba-house/id6743128257"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group"
              >
                <FaApple className="text-4xl group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-xs opacity-80">Download on the</p>
                  <p className="text-xl font-bold">App Store</p>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=appzubahousecom.wpapp&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group"
              >
                <FaGooglePlay className="text-3xl group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-xs opacity-80">GET IT ON</p>
                  <p className="text-xl font-bold">Google Play</p>
                </div>
              </a>
            </motion.div>

            {/* QR Code Section */}
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md mx-auto shadow-2xl"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-6">
                <div className="bg-[#efb291] p-4 rounded-2xl">
                  <FaQrcode className="text-6xl text-[#0b2735]" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-xl font-bold text-[#0b2735] mb-2">Scan to Download</h3>
                  <p className="text-sm text-gray-600">
                    Open your camera and scan this QR code to download the app instantly!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
              variants={staggerContainer}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-[rgba(239,178,145,0.1)] border border-[rgba(239,178,145,0.3)] rounded-2xl p-6 text-center"
                  variants={fadeInUp}
                >
                  <div className="text-[#efb291] text-3xl mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-[#efb291] mb-1">
                    {stat.number}
                  </p>
                  <p className="text-sm text-[#e5e2db] opacity-90">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Benefits Section */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Why Choose the <span className="text-[#efb291]">Zuba House App?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Unlock exclusive features and benefits designed to enhance your shopping experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {appBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-[#efb291] group"
                variants={fadeInUp}
              >
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-4 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* App Preview Banner */}
      <motion.section
        className="py-12 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <div className="inline-block bg-[#efb291] text-[#0b2735] px-4 py-2 rounded-full font-bold text-sm mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold text-[#e5e2db] mb-6">
                  Experience Shopping Like Never Before
                </h2>
                <p className="text-[#e5e2db] opacity-90 text-lg mb-8">
                  Our mobile app is designed with you in mind. Enjoy a seamless, intuitive 
                  interface that makes discovering and buying authentic African products easier 
                  than ever. Plus, get access to features you won&apos;t find anywhere else!
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-[#e5e2db]">
                    <FaCheckCircle className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                    <span>Exclusive app-only discounts up to 50% off</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#e5e2db]">
                    <FaCheckCircle className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                    <span>Flash sales and limited-time offers for app users</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#e5e2db]">
                    <FaCheckCircle className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                    <span>First access to new product launches and collections</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#e5e2db]">
                    <FaCheckCircle className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                    <span>Priority customer support with in-app messaging</span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://apps.apple.com/us/app/zuba-house/id6743128257"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-xl font-bold hover:bg-[#e5a67d] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <FaApple className="text-2xl" />
                    Download for iOS
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=appzubahousecom.wpapp&pcampaignid=web_share"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-xl font-bold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-2"
                  >
                    <FaGooglePlay className="text-xl" />
                    Download for Android
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                variants={fadeInUp}
              >
                <div className="relative z-10 bg-gradient-to-br from-[#efb291] to-[#e5a67d] rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <FaMobileAlt className="text-8xl text-[#efb291] mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#0b2735] mb-4">
                      Download Now & Get
                    </h3>
                    <div className="bg-[#efb291] text-[#0b2735] px-6 py-3 rounded-full font-bold text-2xl mb-4">
                      15% OFF
                    </div>
                    <p className="text-gray-600 mb-6">
                      Your first app purchase! Use code: <strong>APP15</strong>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[#efb291]">
                      <FaGift className="text-2xl" />
                      <span className="font-bold">Limited Time Offer</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#efb291] rounded-full opacity-20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#efb291] rounded-full opacity-20 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Additional Features */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735] mb-4">
              More Features You&apos;ll <span className="text-[#efb291]">Love</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {appFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:border-[#efb291]"
                variants={fadeInUp}
              >
                <div className="text-[#0b2735] hover:text-[#efb291] transition-colors text-4xl mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-[#0b2735] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              What Our Users <span className="text-[#efb291]">Are Saying</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied customers shopping with the Zuba House app
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-[#efb291] transition-all"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-[#efb291] text-xl" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#efb291] flex items-center justify-center text-[#0b2735] font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#0b2735]">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-br from-[#0b2735] via-[#0f3547] to-[#0b2735] relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#efb291] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#efb291] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="bg-[#efb291] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
              variants={fadeInUp}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FaMobileAlt className="text-5xl text-[#0b2735]" />
            </motion.div>

            <motion.h2
              className="text-3xl lg:text-5xl font-bold text-[#e5e2db] mb-6"
              variants={fadeInUp}
            >
              Ready to Start <span className="text-[#efb291]">Saving?</span>
            </motion.h2>

            <motion.p
              className="text-lg text-[#e5e2db] opacity-90 mb-10 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Download the Zuba House app today and unlock exclusive deals, faster checkout, 
              and a personalized shopping experience. Join thousands of satisfied customers!
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
              variants={fadeInUp}
            >
              <a
                href="https://apps.apple.com/us/app/zuba-house/id6743128257"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#0b2735] px-10 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group transform hover:scale-105"
              >
                <FaApple className="text-5xl group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-xs opacity-70">Download on the</p>
                  <p className="text-2xl font-bold">App Store</p>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=appzubahousecom.wpapp&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#0b2735] px-10 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group transform hover:scale-105"
              >
                <FaGooglePlay className="text-4xl group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-xs opacity-70">GET IT ON</p>
                  <p className="text-2xl font-bold">Google Play</p>
                </div>
              </a>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-8 text-[#e5e2db] text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#efb291]" />
                <span>Free to Download</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#efb291]" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#efb291]" />
                <span>Instant Access</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default DownloadApp;


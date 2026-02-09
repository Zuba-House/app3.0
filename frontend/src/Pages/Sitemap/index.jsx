import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaBoxOpen,
  FaTags,
  FaUser,
  FaHeart,
  FaTruck,
  FaCreditCard,
  FaUndo,
  FaQuestionCircle,
  FaEnvelope,
  FaShieldAlt,
  FaInfoCircle,
  FaFileAlt,
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaMobileAlt,
  FaGlobe,
  FaNewspaper,
  FaHandshake,
  FaStore,
  FaPalette,
  FaTshirt,
  FaGem,
  FaCouch,
  FaCoffee,
  FaBook,
  FaMusic,
  FaGift,
  FaSeedling,
  FaMapMarkedAlt,
  FaSearch,
  FaChevronRight,
  FaBars
} from "react-icons/fa";

const Sitemap = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState([]);

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
        staggerChildren: 0.1
      }
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sitemapData = [
    {
      id: "shop",
      title: "Shop",
      icon: <FaShoppingCart className="text-2xl" />,
      color: "bg-blue-500",
      links: [
        { label: "All Products", url: "/products", icon: <FaBoxOpen /> },
        { label: "New Arrivals", url: "/products?filter=new", icon: <FaTags /> },
        { label: "Best Sellers", url: "/products?filter=bestsellers", icon: <FaChartLine /> },
        { label: "Sale Items", url: "/products?filter=sale", icon: <FaTags /> },
        { label: "Shop by Category", url: "/products", icon: <FaBars /> }
      ],
      subcategories: [
        {
          title: "Product Categories",
          items: [
            { label: "Clothing & Fashion", url: "/products?category=clothing", icon: <FaTshirt /> },
            { label: "Jewelry & Accessories", url: "/products?category=jewelry", icon: <FaGem /> },
            { label: "Home & Living", url: "/products?category=home", icon: <FaCouch /> },
            { label: "Art & Decor", url: "/products?category=art", icon: <FaPalette /> },
            { label: "Beauty & Wellness", url: "/products?category=beauty", icon: <FaSeedling /> },
            { label: "Food & Beverages", url: "/products?category=food", icon: <FaCoffee /> },
            { label: "Books & Media", url: "/products?category=books", icon: <FaBook /> },
            { label: "Music & Instruments", url: "/products?category=music", icon: <FaMusic /> },
            { label: "Gifts & Special Occasions", url: "/products?category=gifts", icon: <FaGift /> }
          ]
        }
      ]
    },
    {
      id: "account",
      title: "My Account",
      icon: <FaUser className="text-2xl" />,
      color: "bg-purple-500",
      links: [
        { label: "Sign In", url: "/login", icon: <FaUser /> },
        { label: "Register", url: "/register", icon: <FaUser /> },
        { label: "My Orders", url: "/orders", icon: <FaBoxOpen /> },
        { label: "My Wishlist", url: "/wishlist", icon: <FaHeart /> },
        { label: "Account Settings", url: "/my-account", icon: <FaUser /> },
        { label: "Order History", url: "/orders", icon: <FaFileAlt /> },
        { label: "Addresses", url: "/my-account?tab=addresses", icon: <FaMapMarkedAlt /> },
        { label: "Payment Methods", url: "/my-account?tab=payment", icon: <FaCreditCard /> }
      ]
    },
    {
      id: "customer-service",
      title: "Customer Service",
      icon: <FaQuestionCircle className="text-2xl" />,
      color: "bg-green-500",
      links: [
        { label: "Help Center & FAQ", url: "/faq", icon: <FaQuestionCircle /> },
        { label: "Contact Us", url: "/help-center", icon: <FaEnvelope /> },
        { label: "Track Your Order", url: "/order-tracking", icon: <FaTruck /> },
        { label: "Shipping Information", url: "/shipping-info", icon: <FaTruck /> },
        { label: "Return & Refund Policy", url: "/return-refund-policy", icon: <FaUndo /> },
        { label: "Payment Options", url: "/faq#payment", icon: <FaCreditCard /> },
        { label: "Report Suspicious Activity", url: "/report-suspicious-activity", icon: <FaShieldAlt /> }
      ]
    },
    {
      id: "company",
      title: "About Zuba House",
      icon: <FaInfoCircle className="text-2xl" />,
      color: "bg-orange-500",
      links: [
        { label: "About Us", url: "/about-us", icon: <FaInfoCircle /> },
        { label: "Our Story", url: "/about-us#story", icon: <FaNewspaper /> },
        { label: "Mission & Vision", url: "/about-us#mission", icon: <FaChartLine /> },
        { label: "Meet Our Team", url: "/about-us#team", icon: <FaUsers /> },
        { label: "Careers & Internships", url: "/careers", icon: <FaBriefcase /> },
        { label: "Press & Media", url: "/about-us", icon: <FaNewspaper /> },
        { label: "Investor Relations", url: "/investors", icon: <FaChartLine /> }
      ]
    },
    {
      id: "programs",
      title: "Programs & Partnerships",
      icon: <FaHandshake className="text-2xl" />,
      color: "bg-teal-500",
      links: [
        { label: "Become a Seller", url: "/seller", icon: <FaStore /> },
        { label: "Artisan Partnerships", url: "/about-us#artisans", icon: <FaPalette /> },
        { label: "Affiliate Program", url: "/affiliate-program", icon: <FaHandshake /> },
        { label: "Influencer Collaboration", url: "/affiliate-program", icon: <FaUsers /> },
        { label: "Ship With Us", url: "/ship-with-us", icon: <FaTruck /> },
        { label: "Partner With Us", url: "/partner-with-us", icon: <FaHandshake /> }
      ]
    },
    {
      id: "mobile",
      title: "Mobile Experience",
      icon: <FaMobileAlt className="text-2xl" />,
      color: "bg-pink-500",
      links: [
        { label: "Download Mobile App", url: "/download-app", icon: <FaMobileAlt /> },
        { label: "App Features", url: "/download-app#features", icon: <FaTags /> },
        { label: "App-Only Deals", url: "/download-app#deals", icon: <FaTags /> },
        { label: "iOS App", url: "https://apps.apple.com/us/app/zuba-house/id6743128257", icon: <FaMobileAlt />, external: true },
        { label: "Android App", url: "https://play.google.com/store/apps/details?id=appzubahousecom.wpapp", icon: <FaMobileAlt />, external: true }
      ]
    },
    {
      id: "policies",
      title: "Policies & Legal",
      icon: <FaFileAlt className="text-2xl" />,
      color: "bg-gray-500",
      links: [
        { label: "Terms of Use", url: "/terms-of-use", icon: <FaFileAlt /> },
        { label: "Privacy Policy", url: "/privacy-policy", icon: <FaShieldAlt /> },
        { label: "Cookie Policy", url: "/privacy-policy#cookies", icon: <FaShieldAlt /> },
        { label: "Consumer Health Data Privacy", url: "/consumer-health-data-privacy", icon: <FaShieldAlt /> },
        { label: "Your Privacy Choices", url: "/privacy-choices", icon: <FaShieldAlt /> },
        { label: "Accessibility", url: "/accessibility", icon: <FaInfoCircle /> }
      ]
    },
    {
      id: "discover",
      title: "Discover More",
      icon: <FaGlobe className="text-2xl" />,
      color: "bg-indigo-500",
      links: [
        { label: "Featured Artisans", url: "/about-us#artisans", icon: <FaPalette /> },
        { label: "Sustainability Initiatives", url: "/about-us#sustainability", icon: <FaSeedling /> },
        { label: "Community Stories", url: "/about-us#stories", icon: <FaNewspaper /> },
        { label: "Cultural Collections", url: "/products?filter=cultural", icon: <FaGlobe /> },
        { label: "Gift Guides", url: "/products?category=gifts", icon: <FaGift /> },
        { label: "Seasonal Collections", url: "/products?filter=seasonal", icon: <FaTags /> }
      ]
    }
  ];

  const popularPages = [
    { label: "Home", url: "/", icon: <FaHome />, color: "text-blue-500" },
    { label: "Shop All Products", url: "/products", icon: <FaShoppingCart />, color: "text-purple-500" },
    { label: "Track Order", url: "/order-tracking", icon: <FaTruck />, color: "text-green-500" },
    { label: "My Account", url: "/my-account", icon: <FaUser />, color: "text-orange-500" },
    { label: "Help Center", url: "/faq", icon: <FaQuestionCircle />, color: "text-teal-500" },
    { label: "Download App", url: "/download-app", icon: <FaMobileAlt />, color: "text-pink-500" }
  ];

  // Filter sitemap based on search
  const filteredSitemap = searchQuery
    ? sitemapData.map((section) => ({
        ...section,
        links: section.links.filter((link) =>
          link.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        subcategories: section.subcategories?.map((sub) => ({
          ...sub,
          items: sub.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }))
      })).filter(
        (section) =>
          section.links.length > 0 ||
          section.subcategories?.some((sub) => sub.items.length > 0)
      )
    : sitemapData;

  return (
    <div className="sitemap-page bg-gradient-to-b from-gray-50 to-white">
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
              <FaMapMarkedAlt className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Complete Site Navigation
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Zuba House <span className="text-[#efb291]">Sitemap</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Find everything on Zuba House. Browse our complete directory of pages, 
              products, and services in one convenient location.
            </motion.p>

            {/* Search Bar */}
            <motion.div className="max-w-2xl mx-auto" variants={fadeInUp}>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search sitemap..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 rounded-2xl border-2 border-[rgba(239,178,145,0.3)] bg-white focus:border-[#efb291] focus:outline-none text-[#0b2735] text-lg shadow-xl"
                />
              </div>
              {searchQuery && (
                <p className="text-[#e5e2db] text-sm mt-3 opacity-75">
                  Showing results for &quot;{searchQuery}&quot;
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Popular Pages Quick Access */}
      {!searchQuery && (
        <motion.section
          className="py-12 bg-white border-b border-gray-200"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-8" variants={fadeInUp}>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0b2735] mb-2">
                Popular Pages
              </h2>
              <p className="text-gray-600">Quick access to frequently visited pages</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {popularPages.map((page, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Link
                    to={page.url}
                    className="block bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-[#efb291] hover:shadow-lg transition-all group"
                  >
                    <div className={`${page.color} text-4xl mb-3 flex justify-center group-hover:scale-110 transition-transform`}>
                      {page.icon}
                    </div>
                    <p className="font-semibold text-[#0b2735] text-sm">{page.label}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Sitemap Grid */}
      <motion.section
        className="py-16 lg:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSitemap.map((section) => (
                <motion.div
                  key={section.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all"
                  variants={fadeInUp}
                >
                  {/* Section Header */}
                  <div className={`${section.color} p-6 text-white`}>
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <h3 className="text-xl font-bold">{section.title}</h3>
                    </div>
                    <p className="text-sm opacity-90">
                      {section.links.length + (section.subcategories?.[0]?.items.length || 0)} links
                    </p>
                  </div>

                  {/* Main Links */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          {link.external ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-gray-700 hover:text-[#efb291] hover:translate-x-2 transition-all group"
                            >
                              <div className="text-[#efb291]">{link.icon}</div>
                              <span className="flex-1 text-sm">{link.label}</span>
                              <FaChevronRight className="text-gray-400 group-hover:text-[#efb291] text-xs" />
                            </a>
                          ) : (
                            <Link
                              to={link.url}
                              className="flex items-center gap-3 text-gray-700 hover:text-[#efb291] hover:translate-x-2 transition-all group"
                            >
                              <div className="text-[#efb291]">{link.icon}</div>
                              <span className="flex-1 text-sm">{link.label}</span>
                              <FaChevronRight className="text-gray-400 group-hover:text-[#efb291] text-xs" />
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Subcategories */}
                    {section.subcategories && section.subcategories.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {section.subcategories.map((subcat, subIdx) => (
                          <div key={subIdx}>
                            <button
                              onClick={() => toggleSection(`${section.id}-${subIdx}`)}
                              className="w-full flex items-center justify-between text-left font-semibold text-[#0b2735] mb-3 hover:text-[#efb291] transition-colors"
                            >
                              <span className="text-sm">{subcat.title}</span>
                              <FaChevronRight
                                className={`text-sm transition-transform ${
                                  expandedSections.includes(`${section.id}-${subIdx}`)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </button>

                            {expandedSections.includes(`${section.id}-${subIdx}`) && (
                              <motion.ul
                                className="space-y-2 ml-4 mb-4"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {subcat.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <Link
                                      to={item.url}
                                      className="flex items-center gap-2 text-gray-600 hover:text-[#efb291] hover:translate-x-2 transition-all text-sm group"
                                    >
                                      <div className="text-[#efb291] text-xs">{item.icon}</div>
                                      <span className="flex-1">{item.label}</span>
                                      <FaChevronRight className="text-gray-400 group-hover:text-[#efb291] text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {searchQuery && filteredSitemap.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-500 mb-6">
                  We couldn&apos;t find any pages matching &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="bg-[#efb291] text-[#0b2735] px-8 py-3 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.section
        className="py-16 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-[#e5e2db] mb-6"
              variants={fadeInUp}
            >
              Can&apos;t Find What You&apos;re <span className="text-[#efb291]">Looking For?</span>
            </motion.h2>
            <motion.p
              className="text-lg text-[#e5e2db] opacity-90 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Our support team is here to help you navigate Zuba House and find exactly 
              what you need.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <Link
                to="/help-center"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3"
              >
                <FaEnvelope />
                Contact Support
              </Link>
              <Link
                to="/faq"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                <FaQuestionCircle />
                Browse FAQ
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Sitemap;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHandshake, 
  FaStore, 
  FaChartLine, 
  FaGlobe,
  FaShippingFast,
  FaDollarSign,
  FaUsers,
  FaAward,
  FaRocket,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaPalette,
  FaTshirt,
  FaHome,
  FaPaintBrush,
  FaBox,
  FaPercentage,
  FaHeadset,
  FaChartBar,
  FaShieldAlt
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const PartnerWithUs = () => {
  const [selectedPartnerType, setSelectedPartnerType] = useState('sellers');

  const partnershipTypes = [
    {
      id: 'sellers',
      icon: <FaStore />,
      title: "Become a Seller",
      subtitle: "List your products and reach global customers",
      benefits: [
        "Access to 50+ countries worldwide",
        "Zero upfront listing fees",
        "Competitive 12-15% commission rates",
        "Free seller training and onboarding",
        "Dedicated seller support team",
        "Marketing and promotional opportunities"
      ],
      requirements: [
        "Authentic African products or handmade items",
        "Business registration or artisan certification",
        "Quality product photography",
        "Commitment to shipping within 1-2 business days",
        "Minimum 95% customer satisfaction rating"
      ],
      commission: "12-15%",
      setupTime: "2-3 business days"
    },
    {
      id: 'artisans',
      icon: <FaPalette />,
      title: "Join as Artisan",
      subtitle: "Showcase your handcrafted African art and designs",
      benefits: [
        "Premium artisan profile with story showcase",
        "Featured in 'Artisan Spotlight' collection",
        "Lower 10% commission on handmade items",
        "Custom branding and shop customization",
        "Priority customer support",
        "Exclusive artisan community access"
      ],
      requirements: [
        "Original handmade or hand-designed products",
        "Portfolio of work (minimum 5 pieces)",
        "Authentic African heritage or inspiration",
        "Sustainable and ethical production practices",
        "Ability to fulfill custom orders"
      ],
      commission: "10%",
      setupTime: "3-5 business days"
    },
    {
      id: 'wholesale',
      icon: <FaBox />,
      title: "Wholesale Partnership",
      subtitle: "Bulk supply opportunities for established brands",
      benefits: [
        "Bulk ordering at wholesale prices",
        "Custom product lines and exclusive collections",
        "Flexible payment terms and net-30 options",
        "Dedicated account manager",
        "Marketing collaboration opportunities",
        "Co-branded campaigns and promotions"
      ],
      requirements: [
        "Registered business with tax ID",
        "Minimum order quantities (MOQ) capability",
        "Product catalog with at least 20+ SKUs",
        "Quality certifications (if applicable)",
        "Logistics and warehousing capacity"
      ],
      commission: "Negotiable",
      setupTime: "7-14 business days"
    },
    {
      id: 'affiliates',
      icon: <FaChartLine />,
      title: "Affiliate Program",
      subtitle: "Earn commissions by promoting Zuba House",
      benefits: [
        "8-12% commission on every sale",
        "30-day cookie tracking window",
        "Custom affiliate dashboard and analytics",
        "Exclusive promotional materials and banners",
        "Monthly performance bonuses",
        "Early access to sales and new products"
      ],
      requirements: [
        "Active blog, social media, or website",
        "Audience interested in African culture/fashion",
        "Minimum 1,000 followers or monthly visitors",
        "Compliance with FTC disclosure guidelines",
        "No competing marketplace promotions"
      ],
      commission: "8-12%",
      setupTime: "Instant approval"
    }
  ];

  const whyPartner = [
    {
      icon: <FaGlobe />,
      title: "Global Reach",
      stat: "50+ Countries",
      description: "Expand your market beyond borders with our international shipping network"
    },
    {
      icon: <FaUsers />,
      title: "Growing Customer Base",
      stat: "10K+ Active Buyers",
      description: "Tap into our rapidly growing community of African culture enthusiasts"
    },
    {
      icon: <FaRocket />,
      title: "Fast Growth",
      stat: "20% Monthly Growth",
      description: "Join a fast-scaling platform with exponential market expansion"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payments",
      stat: "100% Protected",
      description: "Bank-level security with guaranteed payment processing"
    },
    {
      icon: <FaHeadset />,
      title: "Dedicated Support",
      stat: "24/7 Assistance",
      description: "Expert support team helping you succeed every step of the way"
    },
    {
      icon: <FaChartBar />,
      title: "Sales Analytics",
      stat: "Real-Time Insights",
      description: "Advanced analytics to track performance and optimize listings"
    }
  ];

  const successStories = [
    {
      name: "Amara Fashion",
      category: "Clothing",
      growth: "300% sales increase",
      quote: "Zuba House helped us reach customers across 15 countries in just 6 months!",
      avatar: "👗"
    },
    {
      name: "Kofi Art Gallery",
      category: "Art & Crafts",
      growth: "$50K+ in revenue",
      quote: "The artisan spotlight feature brought my handmade pieces to a global audience.",
      avatar: "🎨"
    },
    {
      name: "Adisa Home Décor",
      category: "Home Goods",
      growth: "500+ orders monthly",
      quote: "Best decision we made. The logistics support made international shipping seamless.",
      avatar: "🏠"
    }
  ];

  const partnershipProcess = [
    {
      step: 1,
      title: "Apply Online",
      description: "Fill out our simple partnership application form",
      duration: "5 minutes",
      icon: <FaEnvelope />
    },
    {
      step: 2,
      title: "Review & Approval",
      description: "Our team reviews your application and verifies credentials",
      duration: "2-5 business days",
      icon: <FaCheckCircle />
    },
    {
      step: 3,
      title: "Onboarding",
      description: "Complete training, set up your seller profile, and upload products",
      duration: "1-2 days",
      icon: <FaRocket />
    },
    {
      step: 4,
      title: "Start Selling",
      description: "Go live and start receiving orders from global customers",
      duration: "Immediate",
      icon: <FaStore />
    }
  ];

  const faqs = [
    {
      question: "What are the fees to become a seller?",
      answer: "There are no upfront fees to join. We charge a competitive 12-15% commission only on successful sales. Artisans enjoy a reduced 10% commission rate."
    },
    {
      question: "How and when do I receive payments?",
      answer: "Payments are processed weekly via PayPal, bank transfer, or Stripe. Funds are released 7 days after delivery confirmation to protect buyers."
    },
    {
      question: "Can I sell internationally?",
      answer: "Yes! Zuba House handles all international logistics. You just ship to our warehouse, and we manage global distribution to 50+ countries."
    },
    {
      question: "What kind of products can I sell?",
      answer: "We accept authentic African fashion, art, home décor, accessories, and handmade crafts. Products must be original, high-quality, and culturally authentic."
    },
    {
      question: "Do you provide marketing support?",
      answer: "Absolutely! Partners get featured in our newsletters, social media campaigns, seasonal promotions, and the exclusive 'Artisan Spotlight' collection."
    },
    {
      question: "What if I need help managing my shop?",
      answer: "We offer 24/7 seller support, free training webinars, comprehensive guides, and a dedicated account manager for high-volume sellers."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Partner with Zuba House - Sell Globally, Grow Your Business</title>
        <meta name="description" content="Join Zuba House as a seller, artisan, or affiliate partner. Reach customers in 50+ countries, enjoy competitive commissions, and grow your African product business with zero upfront fees." />
        <meta name="keywords" content="partner with Zuba House, become a seller, artisan marketplace, wholesale partnership, affiliate program, sell African products, global marketplace" />
        <link rel="canonical" href="https://zubahouse.com/partner-with-us" />
        <meta property="og:title" content="Partner with Zuba House - Expand Your Business Globally" />
        <meta property="og:description" content="Join 360+ sellers reaching global markets. Zero upfront fees, competitive commissions, and dedicated support to help you succeed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zubahouse.com/partner-with-us" />
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
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-6 py-2 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', border: '1px solid #efb291' }}
            >
              <FaHandshake className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Partnership Opportunities</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Partner with Zuba House
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Join Africa&apos;s fastest-growing marketplace for authentic fashion, art, and home décor. 
              Reach global customers, grow your business, and be part of a cultural movement.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a 
                href="mailto:partners@zubahouse.com"
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                <FaEnvelope className="inline mr-2" />
                Apply Now
              </a>
              <a 
                href="#partnership-types"
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
              >
                Explore Opportunities
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { number: "360+", label: "Active Sellers" },
                { number: "50+", label: "Countries" },
                { number: "12%", label: "Commission Rate" },
                { number: "95%", label: "Satisfaction" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#efb291' }}>
                    {stat.number}
                  </div>
                  <div className="text-sm" style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Why Partner With Us */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Why Partner with Zuba House?
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              We provide everything you need to succeed in the global marketplace
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyPartner.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291', y: -5 }}
                >
                  <div className="text-4xl mb-4" style={{ color: '#efb291' }}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#e5e2db' }}>
                    {item.title}
                  </h3>
                  <div className="text-2xl font-bold mb-3" style={{ color: '#efb291' }}>
                    {item.stat}
                  </div>
                  <p style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Partnership Types */}
        <div id="partnership-types" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Choose Your Partnership Type
            </h2>

            {/* Type Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {partnershipTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedPartnerType(type.id)}
                  className="flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: selectedPartnerType === type.id ? '#efb291' : 'transparent',
                    color: selectedPartnerType === type.id ? '#0b2735' : '#e5e2db',
                    border: `2px solid ${selectedPartnerType === type.id ? '#efb291' : 'rgba(239, 178, 145, 0.3)'}`
                  }}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-semibold">{type.title}</span>
                </button>
              ))}
            </div>

            {/* Active Partnership Details */}
            {partnershipTypes.map((type) => (
              selectedPartnerType === type.id && (
                <motion.div
                  key={type.id}
                  className="p-8 md:p-12 rounded-3xl"
                  style={{ backgroundColor: '#1a3d52', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold" style={{ color: '#e5e2db' }}>
                        {type.title}
                      </h3>
                      <p className="text-lg" style={{ color: '#e5e2db', opacity: 0.8 }}>
                        {type.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="flex gap-4">
                      <div className="px-4 py-2 rounded-full h-fit" style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)' }}>
                        <FaPercentage style={{ color: '#efb291' }} />
                      </div>
                      <div>
                        <div className="text-sm mb-1" style={{ color: '#e5e2db', opacity: 0.7 }}>
                          Commission Rate
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#efb291' }}>
                          {type.commission}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="px-4 py-2 rounded-full h-fit" style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)' }}>
                        <FaRocket style={{ color: '#efb291' }} />
                      </div>
                      <div>
                        <div className="text-sm mb-1" style={{ color: '#e5e2db', opacity: 0.7 }}>
                          Setup Time
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#efb291' }}>
                          {type.setupTime}
                        </div>
                      </div>
                  </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Benefits */}
                    <div>
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#efb291' }}>
                        <FaCheckCircle />
                        Partnership Benefits
                      </h4>
                      <ul className="space-y-3">
                        {type.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <FaCheckCircle className="flex-shrink-0 mt-1" style={{ color: '#efb291' }} />
                            <span style={{ color: '#e5e2db', opacity: 0.9 }}>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#efb291' }}>
                        <FaShieldAlt />
                        Requirements
                      </h4>
                      <ul className="space-y-3">
                        {type.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                            >
                              {i + 1}
                            </div>
                            <span style={{ color: '#e5e2db', opacity: 0.9 }}>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <a 
                      href={`mailto:partners@zubahouse.com?subject=${encodeURIComponent(type.title + ' Application')}&body=${encodeURIComponent('I am interested in becoming a ' + type.title.toLowerCase() + ' at Zuba House.')}`}
                      className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      Apply as {type.title}
                    </a>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* Partnership Process */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              How to Become a Partner
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Simple 4-step process to start selling globally
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnershipProcess.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ borderColor: '#efb291', y: -5 }}
                >
                  <div 
                    className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                    style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                  >
                    {step.step}
                  </div>
                  
                  <div className="text-4xl mb-4 mt-2" style={{ color: '#efb291' }}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#e5e2db' }}>
                    {step.title}
                  </h3>
                  
                  <p className="mb-4" style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {step.description}
                  </p>
                  
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                  >
                    {step.duration}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Partner Success Stories
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Real results from real partners
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291', scale: 1.05 }}
                >
                  <div className="text-6xl mb-4 text-center">{story.avatar}</div>
                  <h3 className="text-xl font-bold mb-2 text-center" style={{ color: '#e5e2db' }}>
                    {story.name}
                  </h3>
                  <div 
                    className="text-sm mb-4 text-center px-3 py-1 rounded-full inline-block"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                  >
                    {story.category}
                  </div>
                  <div className="text-2xl font-bold mb-4 text-center" style={{ color: '#efb291' }}>
                    {story.growth}
                  </div>
                  <p className="text-center italic" style={{ color: '#e5e2db', opacity: 0.85 }}>
                    &quot;{story.quote}&quot;
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Partner Program FAQs
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291' }}
                >
                  <div className="flex items-start gap-4">
                    <FaCheckCircle className="flex-shrink-0 text-xl mt-1" style={{ color: '#efb291' }} />
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

        {/* Final CTA */}
        <div className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="p-12 md:p-16 rounded-3xl text-center"
              style={{ background: 'linear-gradient(135deg, #efb291 0%, #d4a077 100%)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0b2735' }}>
                Ready to Start Your Partnership?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#0b2735', opacity: 0.85 }}>
                Join 360+ successful sellers, artisans, and partners building their businesses 
                with Zuba House. Apply now and start reaching global customers today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="mailto:partners@zubahouse.com?cc=info@zubahouse.com&subject=Partnership Application"
                  className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                  style={{ backgroundColor: '#0b2735', color: '#e5e2db' }}
                >
                  <FaEnvelope className="inline mr-2" />
                  Apply via Email
                </a>
                <a 
                  href="tel:+14375577487"
                  className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#0b2735', border: '3px solid #0b2735' }}
                >
                  <FaPhone className="inline mr-2" />
                  Call Us
                </a>
              </div>
              
              <div className="mt-8 pt-8" style={{ borderTop: '2px solid rgba(11, 39, 53, 0.2)' }}>
                <p className="text-sm mb-2" style={{ color: '#0b2735', opacity: 0.7 }}>
                  Questions about partnerships?
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <span style={{ color: '#0b2735' }}>
                    <FaEnvelope className="inline mr-2" />
                    partners@zubahouse.com
                  </span>
                  <span style={{ color: '#0b2735' }}>
                    <FaEnvelope className="inline mr-2" />
                    info@zubahouse.com
                  </span>
                  <span style={{ color: '#0b2735' }}>
                    <FaPhone className="inline mr-2" />
                    +1 (437) 557-7487
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerWithUs;


import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaGlobeAfrica,
  FaRocket,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaTrophy,
  FaHandshake,
  FaLightbulb,
  FaEnvelope,
  FaFileAlt,
  FaCheckCircle,
  FaArrowRight,
  FaBuilding,
  FaSeedling,
  FaChartBar,
  FaStore,
  FaTruck,
  FaMobileAlt,
  FaAward,
  FaUserTie,
  FaMapMarkedAlt,
  FaBoxOpen,
  FaHeart,
  FaLinkedin,
  FaDownload,
  FaLock
} from "react-icons/fa";

const Investors = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState("overview");

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

  const keyMetrics = [
    {
      icon: <FaUsers className="text-4xl text-[#efb291]" />,
      number: "10k+",
      label: "Active Customers",
      growth: "+150% YoY"
    },
    {
      icon: <FaGlobeAfrica className="text-4xl text-[#efb291]" />,
      number: "54+",
      label: "Countries Served",
      growth: "Expanding"
    },
    {
      icon: <FaShoppingCart className="text-4xl text-[#efb291]" />,
      number: "95%",
      label: "Customer Satisfaction",
      growth: "Industry Leading"
    },
    {
      icon: <FaStore className="text-4xl text-[#efb291]" />,
      number: "80%",
      label: "Sustainable Products",
      growth: "Eco-Conscious"
    }
  ];

  const whyInvest = [
    {
      icon: <FaGlobeAfrica className="text-5xl text-[#efb291]" />,
      title: "Untapped Market Potential",
      description: "The African e-commerce market is projected to reach $75 billion by 2025, growing at 20% CAGR. Zuba House is positioned to capture significant market share in this explosive growth sector."
    },
    {
      icon: <FaHandshake className="text-5xl text-[#efb291]" />,
      title: "Direct Artisan Partnerships",
      description: "We work directly with African artisans, eliminating middlemen and ensuring authentic products. This unique model creates sustainable income for local communities while offering customers genuine cultural products."
    },
    {
      icon: <FaRocket className="text-5xl text-[#efb291]" />,
      title: "Scalable Business Model",
      description: "Our platform-based approach allows rapid expansion to new markets with minimal capital requirements. We've proven the model works and are ready to scale across multiple African countries."
    },
    {
      icon: <FaMobileAlt className="text-5xl text-[#efb291]" />,
      title: "Technology-Driven Growth",
      description: "Our mobile-first platform with exclusive app features drives customer engagement and repeat purchases. 65% of our sales come through mobile, positioning us for the mobile commerce revolution."
    },
    {
      icon: <FaHeart className="text-5xl text-[#efb291]" />,
      title: "Social Impact Mission",
      description: "Every purchase empowers African entrepreneurs and preserves cultural heritage. ESG-conscious investors appreciate our commitment to sustainable development and community impact."
    },
    {
      icon: <FaTrophy className="text-5xl text-[#efb291]" />,
      title: "Proven Traction",
      description: "With 360+ customers, 95% satisfaction rate, and consistent growth, we've validated our product-market fit. Our customer retention rate exceeds industry standards by 40%."
    }
  ];

  const competitiveAdvantages = [
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Authentic Cultural Products",
      description: "Direct sourcing ensures 100% authentic African craftsmanship"
    },
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Global Logistics Network",
      description: "Free international shipping on orders over $100"
    },
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Strong Brand Identity",
      description: "Recognized as the go-to platform for African products"
    },
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Technology Infrastructure",
      description: "Proprietary platform with mobile app and AI recommendations"
    },
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Sustainable Supply Chain",
      description: "70% of products meet sustainability standards"
    },
    {
      icon: <FaCheckCircle className="text-[#efb291]" />,
      title: "Customer Loyalty",
      description: "95% customer satisfaction with high repeat purchase rates"
    }
  ];

  const growthStrategy = [
    {
      phase: "Phase 1: Market Expansion",
      timeline: "Q1-Q2 2025",
      goals: [
        "Expand to 5 additional African countries",
        "Onboard 200+ new artisan partners",
        "Launch localized marketing campaigns",
        "Achieve $2M in quarterly revenue"
      ]
    },
    {
      phase: "Phase 2: Product Diversification",
      timeline: "Q3-Q4 2025",
      goals: [
        "Introduce new product categories (food, beauty)",
        "Launch B2B wholesale platform",
        "Develop private label collections",
        "Open first physical showroom"
      ]
    },
    {
      phase: "Phase 3: Technology Enhancement",
      timeline: "2026",
      goals: [
        "AI-powered personalization engine",
        "AR/VR virtual shopping experience",
        "Blockchain supply chain verification",
        "Launch marketplace for third-party sellers"
      ]
    }
  ];

  const teamHighlights = [
    "Experienced leadership team with 50+ years combined experience in e-commerce and African markets",
    "Advisory board includes former executives from major e-commerce platforms",
    "Strong technical team with expertise in scalable platform architecture",
    "Cultural consultants ensuring authentic representation and ethical sourcing"
  ];

  const useOfFunds = [
    { category: "Market Expansion", percentage: 35, color: "bg-blue-500" },
    { category: "Technology & Platform", percentage: 25, color: "bg-purple-500" },
    { category: "Marketing & Sales", percentage: 20, color: "bg-green-500" },
    { category: "Operations & Logistics", percentage: 15, color: "bg-orange-500" },
    { category: "Working Capital", percentage: 5, color: "bg-gray-500" }
  ];

  return (
    <div className="investors-page bg-white">
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center max-w-5xl mx-auto" variants={fadeInUp}>
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaChartLine className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Investment Opportunity
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-7xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Invest in the Future of{" "}
              <span className="text-[#efb291]">African E-commerce</span>
            </motion.h1>

            <motion.p
              className="text-lg lg:text-2xl text-[#e5e2db] mb-8 opacity-90 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Join us in building the world&apos;s leading platform for authentic African products. 
              Connect global customers with local artisans while generating strong returns.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              variants={fadeInUp}
            >
              <a
                href="mailto:investors@zubahouse.com?cc=info@zubahouse.com&subject=Investment%20Inquiry%20-%20Zuba%20House"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group"
              >
                <FaEnvelope className="group-hover:scale-110 transition-transform" />
                Request Investment Deck
              </a>
              <a
                href="#metrics"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                <FaChartBar />
                View Key Metrics
              </a>
            </motion.div>

            {/* Key Metrics Cards */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
              variants={staggerContainer}
            >
              {keyMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="bg-[rgba(239,178,145,0.1)] border border-[rgba(239,178,145,0.3)] rounded-2xl p-6 backdrop-blur-sm"
                  variants={fadeInUp}
                >
                  <div className="flex justify-center mb-3">{metric.icon}</div>
                  <p className="text-3xl lg:text-4xl font-bold text-[#efb291] mb-1">
                    {metric.number}
                  </p>
                  <p className="text-sm text-[#e5e2db] mb-2">{metric.label}</p>
                  <p className="text-xs text-green-400 font-semibold">{metric.growth}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Invest Section */}
      <motion.section
        id="metrics"
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Why Invest in <span className="text-[#efb291]">Zuba House?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              A unique opportunity to invest in Africa&apos;s e-commerce revolution while making 
              a positive social impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {whyInvest.map((reason, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-[#efb291] group"
                variants={fadeInUp}
              >
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-4 text-center">
                  {reason.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Market Opportunity */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
                Market <span className="text-[#efb291]">Opportunity</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl p-8 lg:p-12 text-[#e5e2db]">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-[#efb291]">
                    African E-commerce Growth
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Market Size (2025)</span>
                        <span className="text-[#efb291] font-bold text-xl">$75B</span>
                      </div>
                      <div className="w-full bg-[rgba(229,226,219,0.2)] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#efb291] to-[#e5a67d] h-3 rounded-full"
                          style={{ width: "75%" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Annual Growth Rate</span>
                        <span className="text-[#efb291] font-bold text-xl">20% CAGR</span>
                      </div>
                      <div className="w-full bg-[rgba(229,226,219,0.2)] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                          style={{ width: "85%" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Mobile Penetration</span>
                        <span className="text-[#efb291] font-bold text-xl">65%</span>
                      </div>
                      <div className="w-full bg-[rgba(229,226,219,0.2)] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Our Market Share Target</span>
                        <span className="text-[#efb291] font-bold text-xl">5%</span>
                      </div>
                      <div className="w-full bg-[rgba(229,226,219,0.2)] rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                          style={{ width: "30%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h3 className="text-2xl font-bold text-[#0b2735] mb-6">
                  Why This Market Matters
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                    <FaMapMarkedAlt className="text-[#efb291] text-2xl flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#0b2735] mb-1">
                        1.4 Billion People
                      </h4>
                      <p className="text-sm text-gray-600">
                        Africa&apos;s population is the youngest and fastest-growing globally, 
                        creating massive consumer demand.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                    <FaMobileAlt className="text-[#efb291] text-2xl flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#0b2735] mb-1">
                        Mobile-First Market
                      </h4>
                      <p className="text-sm text-gray-600">
                        Over 600 million mobile internet users, with smartphone adoption 
                        growing at 15% annually.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                    <FaDollarSign className="text-[#efb291] text-2xl flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#0b2735] mb-1">
                        Rising Middle Class
                      </h4>
                      <p className="text-sm text-gray-600">
                        African middle class expected to reach 1.1 billion by 2060, driving 
                        e-commerce adoption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                    <FaTruck className="text-[#efb291] text-2xl flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-[#0b2735] mb-1">
                        Infrastructure Development
                      </h4>
                      <p className="text-sm text-gray-600">
                        Improved logistics and payment infrastructure enabling seamless 
                        cross-border commerce.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Competitive Advantages */}
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
              Our Competitive <span className="text-[#efb291]">Advantages</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              What sets Zuba House apart from competitors
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {competitiveAdvantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-[#efb291]"
                  variants={fadeInUp}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{advantage.icon}</div>
                    <div>
                      <h3 className="font-bold text-[#0b2735] mb-2">
                        {advantage.title}
                      </h3>
                      <p className="text-sm text-gray-600">{advantage.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Growth Strategy */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Growth <span className="text-[#efb291]">Strategy</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Our roadmap to becoming Africa&apos;s leading e-commerce platform
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8">
            {growthStrategy.map((phase, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border-l-4 border-[#efb291]"
                variants={fadeInUp}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#0b2735] mb-2 md:mb-0">
                    {phase.phase}
                  </h3>
                  <div className="bg-[#efb291] text-[#0b2735] px-6 py-2 rounded-full font-bold text-sm">
                    {phase.timeline}
                  </div>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <FaArrowRight className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Use of Funds */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#e5e2db] mb-4">
                Use of <span className="text-[#efb291]">Funds</span>
              </h2>
              <p className="text-[#e5e2db] opacity-90 text-lg">
                Strategic allocation to maximize growth and returns
              </p>
            </motion.div>

            <motion.div
              className="bg-[rgba(239,178,145,0.1)] border-2 border-[#efb291] rounded-3xl p-8 lg:p-12"
              variants={fadeInUp}
            >
              <div className="space-y-6">
                {useOfFunds.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#e5e2db] font-semibold text-lg">
                        {item.category}
                      </span>
                      <span className="text-[#efb291] font-bold text-2xl">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[rgba(229,226,219,0.2)] rounded-full h-4">
                      <motion.div
                        className={`${item.color} h-4 rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-[rgba(239,178,145,0.3)] grid grid-cols-1 md:grid-cols-2 gap-6 text-[#e5e2db]">
                <div>
                  <h4 className="font-bold text-[#efb291] mb-3">Investment Highlights</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>Seed funding to fuel rapid expansion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>Clear path to profitability within 18 months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>Exit opportunities through strategic acquisition</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-[#efb291] mb-3">Target Milestones</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>$5M ARR by end of 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>10,000+ active customers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-[#efb291] mt-1 flex-shrink-0" />
                      <span>Presence in 15+ countries</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Our <span className="text-[#efb291]">Team</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Experienced leaders committed to building Africa&apos;s e-commerce future
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-200"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#efb291] w-16 h-16 rounded-full flex items-center justify-center">
                  <FaUserTie className="text-3xl text-[#0b2735]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0b2735]">Leadership Team</h3>
              </div>

              <div className="space-y-4">
                {teamHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <FaAward className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                    <p className="text-gray-700">{highlight}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Detailed team bios and credentials available in our investment deck
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl shadow-2xl overflow-hidden"
              variants={fadeInUp}
            >
              <div className="p-8 lg:p-16 text-center">
                <div className="bg-[#efb291] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FaRocket className="text-4xl text-[#0b2735]" />
                </div>

                <h2 className="text-3xl lg:text-5xl font-bold text-[#e5e2db] mb-6">
                  Ready to Join Our Journey?
                </h2>

                <p className="text-lg text-[#e5e2db] opacity-90 mb-10 max-w-3xl mx-auto">
                  We&apos;re seeking strategic investors who share our vision of empowering African 
                  entrepreneurs and building a sustainable, scalable e-commerce platform. 
                  Let&apos;s discuss how we can grow together.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                  <a
                    href="mailto:investors@zubahouse.com?cc=info@zubahouse.com&subject=Investment%20Inquiry%20-%20Zuba%20House&body=Dear%20Zuba%20House%20Team,%0A%0AI%20am%20interested%20in%20learning%20more%20about%20investment%20opportunities%20with%20Zuba%20House.%0A%0AName:%0ACompany/Organization:%0AContact%20Number:%0A%0APlease%20send%20me%20your%20investment%20deck%20and%20additional%20information.%0A%0AThank%20you."
                    className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-2xl hover:shadow-3xl inline-flex items-center justify-center gap-3 group"
                  >
                    <FaEnvelope className="text-2xl group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-xs opacity-80">Contact Investment Team</p>
                      <p className="text-lg font-bold">investors@zubahouse.com</p>
                    </div>
                  </a>

                  <a
                    href="mailto:investors@zubahouse.com?cc=info@zubahouse.com&subject=Investment%20Deck%20Request%20-%20Zuba%20House"
                    className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
                  >
                    <FaDownload />
                    Request Investment Deck
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[#e5e2db] text-sm opacity-75">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-[#efb291]" />
                    <span>investors@zubahouse.com</span>
                  </div>
                  <div className="hidden sm:block">|</div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-[#efb291]" />
                    <span>CC: info@zubahouse.com</span>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[rgba(239,178,145,0.3)] text-[#e5e2db]">
                  <p className="text-sm opacity-75 mb-4">
                    All investment inquiries are handled confidentially
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <FaLock className="text-[#efb291]" />
                      <span>NDA Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-[#efb291]" />
                      <span>Pitch Deck Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-[#efb291]" />
                      <span>Financial Projections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-[#efb291]" />
                      <span>Due Diligence Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Investors;


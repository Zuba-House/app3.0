import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaUserLock, 
  FaDatabase,
  FaCookie,
  FaUserSecret,
  FaLock,
  FaEnvelope,
  FaGlobe,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
  FaDownload
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <FaUserLock />,
      title: "1. Information We Collect",
      subsections: [
        {
          subtitle: "Personal Information",
          content: [
            "Name, email address, phone number",
            "Shipping and billing addresses",
            "Payment information (processed securely by third-party providers)",
            "Account credentials (encrypted passwords)",
            "Profile information and preferences"
          ]
        },
        {
          subtitle: "Automatically Collected Information",
          content: [
            "IP address, browser type, and device information",
            "Cookies and similar tracking technologies",
            "Usage data (pages visited, time spent, clicks)",
            "Location data (with your permission)",
            "Mobile app analytics and crash reports"
          ]
        },
        {
          subtitle: "Information from Third Parties",
          content: [
            "Social media profile data (if you log in via social accounts)",
            "Payment verification from payment processors",
            "Shipping updates from carrier partners",
            "Fraud prevention data from security services"
          ]
        }
      ]
    },
    {
      icon: <FaDatabase />,
      title: "2. How We Use Your Information",
      content: [
        "Process and fulfill your orders, including shipping and delivery",
        "Communicate with you about orders, account updates, and customer service",
        "Send promotional emails and newsletters (with your consent)",
        "Personalize your shopping experience and product recommendations",
        "Improve our website, mobile app, and services",
        "Detect, prevent, and address fraud and security issues",
        "Comply with legal obligations and enforce our Terms of Use",
        "Conduct analytics and market research",
        "Facilitate seller payments and commission calculations"
      ]
    },
    {
      icon: <FaGlobe />,
      title: "3. How We Share Your Information",
      subsections: [
        {
          subtitle: "With Your Consent",
          content: [
            "When you explicitly authorize sharing with third parties",
            "When participating in promotions or contests with partners"
          ]
        },
        {
          subtitle: "Service Providers",
          content: [
            "Payment processors (Stripe, PayPal, etc.)",
            "Shipping and logistics partners",
            "Email service providers (for newsletters and notifications)",
            "Cloud hosting and data storage services",
            "Analytics and marketing platforms",
            "Customer support tools"
          ]
        },
        {
          subtitle: "Sellers",
          content: [
            "Order details (name, shipping address) to fulfill purchases",
            "Communication necessary for order completion",
            "Note: Sellers must comply with our privacy standards"
          ]
        },
        {
          subtitle: "Legal Requirements",
          content: [
            "When required by law or legal process",
            "To protect our rights, property, or safety",
            "To enforce our Terms of Use",
            "In connection with fraud prevention and investigations"
          ]
        },
        {
          subtitle: "Business Transfers",
          content: [
            "In case of merger, acquisition, or sale of assets",
            "You will be notified of any change in data ownership"
          ]
        }
      ]
    },
    {
      icon: <FaCookie />,
      title: "4. Cookies & Tracking Technologies",
      content: [
        "We use cookies, web beacons, and similar technologies to enhance your experience.",
        "Essential cookies: Required for website functionality (shopping cart, account login)",
        "Performance cookies: Help us understand how you use our site to improve it",
        "Advertising cookies: Used to show relevant ads based on your interests",
        "You can control cookies through your browser settings, but disabling may affect functionality.",
        "For more details, see our Cookie Policy or manage preferences in your account settings."
      ]
    },
    {
      icon: <FaLock />,
      title: "5. Data Security",
      content: [
        "We implement industry-standard security measures to protect your information:",
        "SSL/TLS encryption for all data transmission",
        "Secure, encrypted storage of sensitive data",
        "Regular security audits and vulnerability assessments",
        "Access controls and authentication protocols",
        "Employee training on data protection best practices",
        "However, no system is 100% secure. We cannot guarantee absolute security.",
        "Report security concerns immediately to security@zubahouse.com."
      ]
    },
    {
      icon: <FaUserSecret />,
      title: "6. Your Privacy Rights",
      subsections: [
        {
          subtitle: "Access & Correction",
          content: [
            "You can view and update your personal information in your account settings",
            "Request a copy of all data we hold about you"
          ]
        },
        {
          subtitle: "Data Portability",
          content: [
            "Request your data in a machine-readable format",
            "Transfer your data to another service (where technically feasible)"
          ]
        },
        {
          subtitle: "Deletion",
          content: [
            "Request deletion of your account and personal data",
            "30-day grace period allows you to recover your account",
            "Some data may be retained for legal or business purposes (e.g., transaction records)"
          ]
        },
        {
          subtitle: "Marketing Opt-Out",
          content: [
            "Unsubscribe from promotional emails via the link in any email",
            "Manage notification preferences in your account settings",
            "Note: You will still receive transactional emails (order confirmations, shipping updates)"
          ]
        },
        {
          subtitle: "Do Not Track",
          content: [
            "We currently do not respond to Do Not Track signals",
            "You can control tracking through browser settings and our privacy choices page"
          ]
        }
      ]
    },
    {
      icon: <FaGlobe />,
      title: "7. International Data Transfers",
      content: [
        "Zuba House operates globally. Your data may be transferred to and stored in countries outside your residence.",
        "We ensure adequate data protection through:",
        "Standard contractual clauses approved by regulatory authorities",
        "Compliance with GDPR (for EU users), CCPA (for California users), and PIPEDA (for Canadian users)",
        "Servers located in secure, certified data centers",
        "By using our services, you consent to international data transfers as described."
      ]
    },
    {
      icon: <FaCheckCircle />,
      title: "8. Children's Privacy",
      content: [
        "Zuba House is not intended for children under 18.",
        "We do not knowingly collect personal information from children.",
        "If you believe a child has provided us with personal information, contact us immediately at privacy@zubahouse.com.",
        "We will promptly delete such information upon verification."
      ]
    },
    {
      icon: <FaDatabase />,
      title: "9. Data Retention",
      content: [
        "We retain your personal information for as long as necessary to provide our services.",
        "Account data: Retained while your account is active",
        "Order history: Retained for 7 years for tax and legal compliance",
        "Marketing data: Retained until you opt out or request deletion",
        "Analytics data: Aggregated and anonymized, retained indefinitely",
        "Deleted accounts: 30-day recovery period, then permanent deletion (except legally required records)"
      ]
    },
    {
      icon: <FaExclamationTriangle />,
      title: "10. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time.",
        "Material changes will be notified via email or prominent notice on our website.",
        "Continued use of our services after changes constitutes acceptance.",
        "We encourage you to review this page periodically.",
        "Last updated date is displayed at the top of this policy."
      ]
    },
    {
      icon: <FaEnvelope />,
      title: "11. Contact Us",
      content: [
        "For questions or concerns about this Privacy Policy or your data:",
        "Email: privacy@zubahouse.com",
        "CC: info@zubahouse.com",
        "Phone: +1 (437) 557-7487",
        "Mail: Zuba House Privacy Team, 119 Chem Rivermead, Gatineau, QC J9H 5W5, Canada",
        "Response time: Within 30 days of receiving your request"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Zuba House | How We Protect Your Data</title>
        <meta name="description" content="Read Zuba House's Privacy Policy. Learn how we collect, use, protect, and manage your personal information when you shop on our platform." />
        <meta name="keywords" content="Zuba House privacy policy, data protection, personal information, privacy rights, GDPR, CCPA" />
        <link rel="canonical" href="https://zubahouse.com/privacy-policy" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#0b2735' }}>
        {/* Hero Section */}
        <motion.div 
          className="py-20 px-6"
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
              <FaShieldAlt className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Your Privacy Matters</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Privacy Policy
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-4"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Learn how Zuba House collects, uses, and protects your personal information
            </motion.p>

            <motion.p 
              className="text-lg"
              style={{ color: '#efb291' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Last Updated: January 15, 2025
            </motion.p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="py-8 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: <FaDownload />, text: 'Download Your Data', link: '/my-account/privacy' },
                { icon: <FaTrash />, text: 'Delete Account', link: '/delete-account' },
                { icon: <FaUserSecret />, text: 'Privacy Choices', link: '/privacy-choices' },
                { icon: <FaCookie />, text: 'Cookie Settings', link: '/privacy-choices#cookies' }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.3)' }}
                >
                  <div className="text-2xl mb-2" style={{ color: '#efb291' }}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#e5e2db' }}>
                    {action.text}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ borderColor: '#efb291' }}
                >
                  {/* Section Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                    >
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold flex-1" style={{ color: '#e5e2db' }}>
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Content */}
                  <div className="ml-16 space-y-4">
                    {section.subsections ? (
                      section.subsections.map((sub, i) => (
                        <div key={i} className="mb-6">
                          <h3 className="text-lg font-bold mb-3" style={{ color: '#efb291' }}>
                            {sub.subtitle}
                          </h3>
                          <ul className="space-y-2">
                            {sub.content.map((item, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span style={{ color: '#efb291' }}>•</span>
                                <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      section.content.map((paragraph, i) => (
                        <p 
                          key={i} 
                          className="text-base leading-relaxed"
                          style={{ color: '#e5e2db', opacity: 0.9 }}
                        >
                          {paragraph}
                        </p>
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FaEnvelope className="text-5xl mx-auto mb-6" style={{ color: '#efb291' }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                Questions About Your Privacy?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Contact our privacy team for any concerns or data requests
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="mailto:privacy@zubahouse.com?cc=info@zubahouse.com"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                >
                  <FaEnvelope className="inline mr-2" />
                  Email Privacy Team
                </a>
                <Link 
                  to="/privacy-choices"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
                >
                  Manage Privacy Settings
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Pages */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ color: '#e5e2db' }}>
              Related Legal Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Terms of Use', link: '/terms-of-use' },
                { title: 'Consumer Health Data', link: '/consumer-health-data-privacy' },
                { title: 'Privacy Choices', link: '/privacy-choices' }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="p-6 rounded-xl text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                >
                  <p className="font-semibold" style={{ color: '#efb291' }}>{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;


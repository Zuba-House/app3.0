import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeartbeat, 
  FaShieldAlt, 
  FaUserMd,
  FaLock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEnvelope,
  FaCheckCircle
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ConsumerHealthData = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Consumer Health Data Privacy Policy - Zuba House</title>
        <meta name="description" content="Zuba House's Consumer Health Data Privacy Policy. Learn how we handle health-related information in compliance with privacy regulations." />
        <link rel="canonical" href="https://zubahouse.com/consumer-health-data-privacy" />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#0b2735' }}>
        {/* Hero Section */}
        <motion.div 
          className="py-20 px-6"
          style={{ background: 'linear-gradient(135deg, #0b2735 0%, #1a3d52 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-6 py-2 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', border: '1px solid #efb291' }}
            >
              <FaHeartbeat className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Health Data Protection</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Consumer Health Data Privacy Policy
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-4"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              How Zuba House handles consumer health-related information
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

        {/* Important Notice */}
        <div className="py-8 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-xl" style={{ backgroundColor: '#0b2735', border: '2px solid #efb291' }}>
              <FaInfoCircle className="text-3xl flex-shrink-0" style={{ color: '#efb291' }} />
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#efb291' }}>
                  Important Notice
                </h3>
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Zuba House is primarily a marketplace for African fashion, art, and home décor. 
                  We do NOT intentionally collect, process, or sell consumer health data as defined 
                  by health privacy laws (HIPAA, state health privacy laws, etc.).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Section 1 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaUserMd />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  1. What is Consumer Health Data?
                </h2>
              </div>
              <div className="ml-16 space-y-4">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Consumer health data includes personal information that identifies or can be used to infer 
                  an individual's physical or mental health status, medical history, treatment, diagnosis, or health conditions.
                </p>
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Examples include:
                </p>
                <ul className="space-y-2">
                  {[
                    'Medical records and health history',
                    'Prescription and medication information',
                    'Biometric data (e.g., heart rate, blood pressure)',
                    'Mental health information',
                    'Genetic or genomic data',
                    'Health insurance information'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: '#efb291' }}>•</span>
                      <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 2 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaShieldAlt />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  2. Our Position on Consumer Health Data
                </h2>
              </div>
              <div className="ml-16 space-y-4">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  <strong>Zuba House does NOT:</strong>
                </p>
                <ul className="space-y-2">
                  {[
                    'Collect consumer health data intentionally or as part of our core business',
                    'Sell, share, or process health data for advertising or marketing purposes',
                    'Operate as a health care provider, health plan, or health data processor',
                    'Offer health-related products or services that require health data collection',
                    'Use health data to make decisions about eligibility, pricing, or services'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FaCheckCircle style={{ color: '#10b981' }} className="mt-1 flex-shrink-0" />
                      <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 3 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaExclamationTriangle />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  3. Incidental Health Information
                </h2>
              </div>
              <div className="ml-16 space-y-4">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  In rare cases, we may incidentally receive health-related information through:
                </p>
                <ul className="space-y-3">
                  {[
                    {
                      title: 'Customer Support Inquiries',
                      desc: 'If you voluntarily share health information in a support ticket or communication'
                    },
                    {
                      title: 'Product Reviews',
                      desc: 'If you mention health-related topics in product reviews (e.g., "This dress is comfortable for my back pain")'
                    },
                    {
                      title: 'Special Accommodation Requests',
                      desc: 'If you request accommodations related to a disability or health condition'
                    }
                  ].map((item, i) => (
                    <li key={i}>
                      <strong style={{ color: '#efb291' }}>{item.title}:</strong>{' '}
                      <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item.desc}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ color: '#e5e2db', opacity: 0.9 }} className="mt-4">
                  <strong>How We Handle It:</strong> Such information is treated as confidential, used solely for 
                  the purpose you provided it, and NOT shared, sold, or used for marketing. We encourage you to 
                  avoid sharing unnecessary health details in communications.
                </p>
              </div>
            </motion.div>

            {/* Section 4 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaLock />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  4. Your Rights Regarding Health Data
                </h2>
              </div>
              <div className="ml-16 space-y-4">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Even though we do not intentionally collect health data, you have the right to:
                </p>
                <ul className="space-y-2">
                  {[
                    'Request deletion of any health information you may have shared',
                    'Withdraw consent for processing such information',
                    'Request that we do not share your information with third parties',
                    'File a complaint if you believe your health data was mishandled'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: '#efb291' }}>•</span>
                      <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ color: '#e5e2db', opacity: 0.9 }} className="mt-4">
                  To exercise these rights, contact us at <strong style={{ color: '#efb291' }}>privacy@zubahouse.com</strong>
                </p>
              </div>
            </motion.div>

            {/* Section 5 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaShieldAlt />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  5. Compliance with Health Privacy Laws
                </h2>
              </div>
              <div className="ml-16 space-y-4">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Zuba House complies with applicable health privacy laws and regulations, including but not limited to:
                </p>
                <ul className="space-y-2">
                  {[
                    'Washington My Health My Data Act',
                    'Nevada Consumer Health Data Privacy Law',
                    'California Consumer Privacy Act (CCPA) health data provisions',
                    'Canadian Personal Information Protection and Electronic Documents Act (PIPEDA)',
                    'European Union General Data Protection Regulation (GDPR) special category data provisions'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: '#efb291' }}>•</span>
                      <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 6 */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: '#efb291' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                >
                  <FaEnvelope />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                  6. Contact Us
                </h2>
              </div>
              <div className="ml-16 space-y-3">
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  If you have questions or concerns about health data privacy:
                </p>
                <div style={{ color: '#e5e2db', opacity: 0.9 }}>
                  <p><strong style={{ color: '#efb291' }}>Email:</strong> privacy@zubahouse.com</p>
                  <p><strong style={{ color: '#efb291' }}>CC:</strong> info@zubahouse.com</p>
                  <p><strong style={{ color: '#efb291' }}>Phone:</strong> +1 (437) 557-7487</p>
                  <p><strong style={{ color: '#efb291' }}>Mail:</strong> Zuba House Privacy Team, 119 Chem Rivermead, Gatineau, QC J9H 5W5, Canada</p>
                </div>
              </div>
            </motion.div>
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
                Questions About Health Data Privacy?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Contact our privacy team for any concerns
              </p>
              <a 
                href="mailto:privacy@zubahouse.com?cc=info@zubahouse.com"
                className="inline-block px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                <FaEnvelope className="inline mr-2" />
                Email Privacy Team
              </a>
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
                { title: 'Privacy Policy', link: '/privacy-policy' },
                { title: 'Terms of Use', link: '/terms-of-use' },
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

export default ConsumerHealthData;


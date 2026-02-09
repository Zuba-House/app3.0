import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserSecret, 
  FaCookie,
  FaBell,
  FaEnvelope,
  FaEye,
  FaTrash,
  FaDownload,
  FaShieldAlt,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyChoices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock state for toggle switches (in real app, these would sync with backend)
  const [preferences, setPreferences] = useState({
    marketing: true,
    analytics: true,
    personalization: true,
    thirdParty: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // In real app: send update to backend
    console.log(`Updated ${key} to:`, !preferences[key]);
  };

  const privacyOptions = [
    {
      icon: <FaCookie />,
      title: "Cookie Preferences",
      description: "Control how we use cookies and similar technologies on our website",
      options: [
        {
          key: 'analytics',
          label: 'Analytics Cookies',
          description: 'Help us understand how you use our site to improve your experience',
          required: false
        },
        {
          key: 'marketing',
          label: 'Marketing Cookies',
          description: 'Used to show you relevant ads based on your interests',
          required: false
        },
        {
          key: 'personalization',
          label: 'Personalization Cookies',
          description: 'Remember your preferences and customize your experience',
          required: false
        }
      ]
    },
    {
      icon: <FaBell />,
      title: "Notification Preferences",
      description: "Choose how you want to receive updates from Zuba House",
      options: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Order updates, shipping notifications, and account alerts',
          required: false
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Real-time alerts on your mobile device',
          required: false
        },
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          description: 'Text messages for urgent order updates',
          required: false
        }
      ]
    },
    {
      icon: <FaEye />,
      title: "Data Sharing",
      description: "Control how your data is shared with third parties",
      options: [
        {
          key: 'thirdParty',
          label: 'Third-Party Sharing',
          description: 'Allow sharing with marketing partners for personalized offers',
          required: false
        }
      ]
    }
  ];

  const dataRights = [
    {
      icon: <FaDownload />,
      title: "Download Your Data",
      description: "Get a copy of all personal information we have about you",
      action: "Request Download",
      link: "/my-account/privacy"
    },
    {
      icon: <FaEye />,
      title: "Access Your Data",
      description: "View what personal information we store about you",
      action: "View Data",
      link: "/my-account/privacy"
    },
    {
      icon: <FaTrash />,
      title: "Delete Your Account",
      description: "Permanently delete your account and all associated data",
      action: "Delete Account",
      link: "/delete-account"
    },
    {
      icon: <FaShieldAlt />,
      title: "Restrict Processing",
      description: "Limit how we use your personal information",
      action: "Contact Us",
      link: "mailto:privacy@zubahouse.com"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Your Privacy Choices - Zuba House | Manage Your Data</title>
        <meta name="description" content="Manage your privacy settings, control cookies, notifications, and data sharing preferences on Zuba House. Exercise your data rights." />
        <meta name="keywords" content="privacy choices, privacy settings, cookie preferences, data rights, manage privacy" />
        <link rel="canonical" href="https://zubahouse.com/privacy-choices" />
        <meta name="robots" content="index, follow" />
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
              <FaUserSecret className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Take Control</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your Privacy Choices
            </motion.h1>
            
            <motion.p 
              className="text-xl"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Manage your privacy settings, control your data, and customize your experience
            </motion.p>
          </div>
        </motion.div>

        {/* Privacy Controls */}
        <div className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {privacyOptions.map((category, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ borderColor: '#efb291' }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                      {category.title}
                    </h2>
                    <p style={{ color: '#e5e2db', opacity: 0.7 }}>
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 ml-16">
                  {category.options.map((option, i) => (
                    <div 
                      key={i}
                      className="flex items-start justify-between p-4 rounded-xl transition-all duration-300"
                      style={{ backgroundColor: 'rgba(11, 39, 53, 0.5)' }}
                    >
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: '#e5e2db' }}>
                            {option.label}
                          </h3>
                          {option.required && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                            >
                              REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#e5e2db', opacity: 0.8 }}>
                          {option.description}
                        </p>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => !option.required && togglePreference(option.key)}
                        disabled={option.required}
                        className={`flex-shrink-0 text-4xl transition-all duration-300 ${
                          option.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        }`}
                        style={{ color: preferences[option.key] ? '#10b981' : '#6b7280' }}
                      >
                        {preferences[option.key] ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="mt-6 ml-16">
                  <button
                    className="px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    onClick={() => alert('Settings saved! (In real app, this would save to backend)')}
                  >
                    <FaCheckCircle className="inline mr-2" />
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Data Rights */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Exercise Your Data Rights
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              You have full control over your personal information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataRights.map((right, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ borderColor: '#efb291', y: -5 }}
                >
                  <div className="text-4xl mb-4" style={{ color: '#efb291' }}>
                    {right.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#e5e2db' }}>
                    {right.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#e5e2db', opacity: 0.8 }}>
                    {right.description}
                  </p>
                  {right.link.startsWith('mailto:') ? (
                    <a
                      href={right.link}
                      className="inline-block px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      {right.action}
                    </a>
                  ) : (
                    <Link
                      to={right.link}
                      className="inline-block px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                    >
                      {right.action}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Do Not Sell My Info */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="p-8 rounded-2xl"
              style={{ backgroundColor: '#1a3d52', border: '2px solid #efb291' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4">
                <FaInfoCircle className="text-3xl flex-shrink-0" style={{ color: '#efb291' }} />
                <div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#e5e2db' }}>
                    Do Not Sell or Share My Personal Information
                  </h3>
                  <p className="mb-4" style={{ color: '#e5e2db', opacity: 0.9 }}>
                    Under certain privacy laws (like CCPA), you have the right to opt out of the "sale" or "sharing" 
                    of your personal information. Zuba House does NOT sell your personal information to third parties. 
                    However, some data sharing with advertising partners may qualify as "sharing" under these laws.
                  </p>
                  <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{ backgroundColor: 'rgba(11, 39, 53, 0.5)' }}>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: '#e5e2db' }}>
                        Opt Out of Data Sharing for Advertising
                      </p>
                      <p className="text-sm" style={{ color: '#e5e2db', opacity: 0.7 }}>
                        Prevent your data from being shared with advertising networks
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('thirdParty')}
                      className="text-4xl transition-all duration-300 hover:scale-110"
                      style={{ color: !preferences.thirdParty ? '#10b981' : '#6b7280' }}
                    >
                      {!preferences.thirdParty ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                  <p className="text-sm" style={{ color: '#e5e2db', opacity: 0.7 }}>
                    For more information or to submit a request, contact us at{' '}
                    <a href="mailto:privacy@zubahouse.com" style={{ color: '#efb291' }} className="underline">
                      privacy@zubahouse.com
                    </a>
                  </p>
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
                Need Help with Privacy Settings?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Our privacy team is here to assist you with any questions
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
                  to="/privacy-policy"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
                >
                  Read Privacy Policy
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
                { title: 'Privacy Policy', link: '/privacy-policy' },
                { title: 'Terms of Use', link: '/terms-of-use' },
                { title: 'Consumer Health Data', link: '/consumer-health-data-privacy' }
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

export default PrivacyChoices;


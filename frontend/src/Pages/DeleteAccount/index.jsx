import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaUserSlash,
  FaExclamationTriangle,
  FaDesktop,
  FaMobileAlt,
  FaEnvelope,
  FaShieldAlt,
  FaTrashAlt,
  FaCheckCircle,
  FaClock,
  FaDatabase,
  FaUndo,
  FaInfoCircle,
  FaLock,
  FaQuestionCircle,
  FaPhone,
  FaArrowRight,
  FaDownload,
  FaHeart,
  FaBox
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const DeleteAccount = () => {
  const [activeMethod, setActiveMethod] = useState('website');
  const [showWarning, setShowWarning] = useState(true);

  const deletionMethods = [
    {
      id: 'website',
      icon: <FaDesktop />,
      title: "Delete via Website",
      platform: "Desktop Browser",
      steps: [
        {
          number: "1",
          title: "Log Into Your Account",
          description: "Visit zubahouse.com and sign in using your email and password",
          icon: <FaLock />,
          tip: "Make sure you're logged into the correct account you want to delete"
        },
        {
          number: "2",
          title: "Go to My Account",
          description: "Click on your profile icon in the top-right corner and select 'My Account' from the dropdown menu",
          icon: <FaUserSlash />,
          tip: "You can also access this directly at zubahouse.com/my-account"
        },
        {
          number: "3",
          title: "Navigate to Account Settings",
          description: "In the left sidebar menu, click on 'Account Settings' or 'Privacy & Security'",
          icon: <FaShieldAlt />,
          tip: "Scroll down to find the 'Account Management' section"
        },
        {
          number: "4",
          title: "Find Delete Account Option",
          description: "Scroll to the bottom of the page to find 'Delete My Account' button in red",
          icon: <FaTrashAlt />,
          tip: "This option is at the very bottom to prevent accidental clicks"
        },
        {
          number: "5",
          title: "Review Warning & Confirm",
          description: "Read the deletion warning carefully. Check the box confirming you understand data will be permanently deleted",
          icon: <FaExclamationTriangle />,
          tip: "Take note of what data will be lost before proceeding"
        },
        {
          number: "6",
          title: "Enter Password & Submit",
          description: "Enter your account password to verify it's you. Click 'Delete Account Permanently'",
          icon: <FaCheckCircle />,
          tip: "You'll receive a confirmation email immediately after submission"
        },
        {
          number: "7",
          title: "30-Day Grace Period Begins",
          description: "Your account is deactivated immediately but can be recovered within 30 days by logging in",
          icon: <FaClock />,
          tip: "After 30 days, deletion becomes permanent and irreversible"
        }
      ]
    },
    {
      id: 'app',
      icon: <FaMobileAlt />,
      title: "Delete via Mobile App",
      platform: "iOS & Android",
      steps: [
        {
          number: "1",
          title: "Open Zuba House App",
          description: "Launch the Zuba House mobile app on your iOS or Android device",
          icon: <FaMobileAlt />,
          tip: "Ensure you're using the latest version of the app for best experience"
        },
        {
          number: "2",
          title: "Access Profile Menu",
          description: "Tap the menu icon (three horizontal lines) in the bottom-right corner",
          icon: <FaUserSlash />,
          tip: "You'll see your profile picture and name at the top"
        },
        {
          number: "3",
          title: "Go to Settings",
          description: "Scroll down and tap 'Settings' or the gear icon in the profile menu",
          icon: <FaShieldAlt />,
          tip: "Settings is usually near the bottom of the menu list"
        },
        {
          number: "4",
          title: "Select Account Management",
          description: "Tap 'Account Settings' then scroll to find 'Delete Account' option",
          icon: <FaTrashAlt />,
          tip: "On iOS, you may need to tap 'Privacy & Security' first"
        },
        {
          number: "5",
          title: "Read Deletion Information",
          description: "Review what will happen when you delete your account. Tap 'Continue to Delete Account'",
          icon: <FaInfoCircle />,
          tip: "Download your data first if you want to keep order history or wishlist"
        },
        {
          number: "6",
          title: "Select Deletion Reason",
          description: "Choose a reason for leaving (optional but helps us improve). Tap 'Next'",
          icon: <FaQuestionCircle />,
          tip: "Your feedback is valuable and completely anonymous"
        },
        {
          number: "7",
          title: "Verify & Confirm",
          description: "Enter your password. Toggle the confirmation switch. Tap 'Delete Account'",
          icon: <FaCheckCircle />,
          tip: "A confirmation email will be sent to your registered email address"
        },
        {
          number: "8",
          title: "Grace Period Activated",
          description: "Account is deactivated. You have 30 days to change your mind by logging back in",
          icon: <FaClock />,
          tip: "Simply log in again within 30 days to cancel the deletion request"
        }
      ]
    },
    {
      id: 'email',
      icon: <FaEnvelope />,
      title: "Request via Email",
      platform: "Customer Support",
      steps: [
        {
          number: "1",
          title: "Compose Email Request",
          description: "Send an email to contact@zubahouse.com with CC to info@zubahouse.com",
          icon: <FaEnvelope />,
          tip: "Use the email address registered with your account for faster processing"
        },
        {
          number: "2",
          title: "Use Correct Subject Line",
          description: "Subject: 'Account Deletion Request - [Your Email Address]'",
          icon: <FaInfoCircle />,
          tip: "Clear subject lines help us prioritize and process your request faster"
        },
        {
          number: "3",
          title: "Include Required Information",
          description: "Provide: Full name, registered email, phone number (if applicable), reason for deletion (optional)",
          icon: <FaDatabase />,
          tip: "More details help us verify your identity and prevent unauthorized deletions"
        },
        {
          number: "4",
          title: "Identity Verification",
          description: "Our team will send you a verification code or ask security questions to confirm it's really you",
          icon: <FaShieldAlt />,
          tip: "This protects your account from unauthorized deletion attempts"
        },
        {
          number: "5",
          title: "Confirm Deletion Intent",
          description: "Reply to our verification email confirming you understand the deletion is permanent after 30 days",
          icon: <FaCheckCircle />,
          tip: "Make sure to check your spam folder for our response"
        },
        {
          number: "6",
          title: "Processing Time",
          description: "Account deletion requests via email are processed within 2-3 business days",
          icon: <FaClock />,
          tip: "You'll receive confirmation once the deletion process has started"
        },
        {
          number: "7",
          title: "Grace Period Active",
          description: "Your account is deactivated. Contact us within 30 days if you change your mind",
          icon: <FaUndo />,
          tip: "After 30 days, all data is permanently erased from our systems"
        }
      ]
    }
  ];

  const whatGetsDeleted = [
    {
      icon: <FaUserSlash />,
      title: "Personal Information",
      items: [
        "Full name and profile details",
        "Email address and phone number",
        "Shipping and billing addresses",
        "Payment methods (cards removed immediately)",
        "Account preferences and settings"
      ]
    },
    {
      icon: <FaBox />,
      title: "Order & Purchase History",
      items: [
        "All past orders and invoices",
        "Purchase receipts and tracking info",
        "Returns and refund history",
        "Product reviews you've written",
        "Seller ratings and feedback"
      ]
    },
    {
      icon: <FaHeart />,
      title: "Saved Preferences",
      items: [
        "Wishlist and saved items",
        "Shopping cart contents",
        "Product notifications and alerts",
        "Followed sellers and stores",
        "Browsing history and recommendations"
      ]
    },
    {
      icon: <FaEnvelope />,
      title: "Communications",
      items: [
        "Email subscription preferences",
        "Marketing and promotional consents",
        "Support tickets and chat history",
        "Notifications settings",
        "Newsletter subscriptions"
      ]
    }
  ];

  const beforeYouDelete = [
    {
      icon: <FaDownload />,
      title: "Download Your Data",
      description: "Request a copy of your account data before deletion. This includes order history, reviews, and personal information.",
      action: "Go to Settings > Privacy > Download My Data",
      important: true
    },
    {
      icon: <FaBox />,
      title: "Complete Pending Orders",
      description: "Make sure all your orders are delivered and any returns/refunds are processed. Active orders may delay deletion.",
      action: "Check 'My Orders' for any pending transactions",
      important: true
    },
    {
      icon: <FaHeart />,
      title: "Save Your Wishlist",
      description: "Your wishlist will be permanently deleted. Take screenshots or note down items you want to remember.",
      action: "Export wishlist via Settings > My Wishlist",
      important: false
    },
    {
      icon: <FaUndo />,
      title: "Cancel Active Subscriptions",
      description: "If you have any premium subscriptions or recurring orders, cancel them before deleting your account.",
      action: "Visit Settings > Subscriptions & Memberships",
      important: false
    },
    {
      icon: <FaShieldAlt />,
      title: "Remove Payment Methods",
      description: "All saved payment methods will be deleted, but you can remove them manually for peace of mind.",
      action: "Go to Settings > Payment Methods > Remove All",
      important: false
    },
    {
      icon: <FaEnvelope />,
      title: "Update Email Preferences",
      description: "If you only want to stop receiving emails, consider unsubscribing instead of deleting your account.",
      action: "Manage preferences at Settings > Email Notifications",
      important: false
    }
  ];

  const importantWarnings = [
    {
      icon: <FaExclamationTriangle />,
      title: "Deletion is Permanent After 30 Days",
      description: "Once the 30-day grace period ends, your account and all associated data are permanently erased and cannot be recovered under any circumstances."
    },
    {
      icon: <FaClock />,
      title: "30-Day Grace Period",
      description: "You have 30 days to change your mind. Simply log back into your account within this period to cancel the deletion request."
    },
    {
      icon: <FaBox />,
      title: "Active Orders Must Complete",
      description: "If you have pending orders, returns, or disputes, your account deletion will be delayed until these are resolved."
    },
    {
      icon: <FaDatabase />,
      title: "Some Data Retained for Legal Compliance",
      description: "We may retain certain transaction records for tax, legal, and fraud prevention purposes as required by law (typically 7 years)."
    },
    {
      icon: <FaUndo />,
      title: "No Account Recovery After 30 Days",
      description: "You cannot reactivate a deleted account. You'll need to create a new account if you wish to use Zuba House again in the future."
    },
    {
      icon: <FaHeart />,
      title: "Seller Accounts Require Additional Steps",
      description: "If you're a seller, you must close your store, settle all payments, and resolve customer issues before account deletion."
    }
  ];

  const alternatives = [
    {
      icon: <FaLock />,
      title: "Temporarily Deactivate",
      description: "Hide your profile and stop receiving notifications without losing your data. Reactivate anytime.",
      benefit: "Keep your purchase history and wishlist"
    },
    {
      icon: <FaEnvelope />,
      title: "Unsubscribe from Emails",
      description: "Stop marketing emails and newsletters while keeping your account active for future purchases.",
      benefit: "Stay registered for faster checkout"
    },
    {
      icon: <FaShieldAlt />,
      title: "Update Privacy Settings",
      description: "Control what data we collect and how it's used. Limit data sharing and personalization.",
      benefit: "More privacy without losing your account"
    },
    {
      icon: <FaUserSlash />,
      title: "Remove Personal Information",
      description: "Delete saved addresses, payment methods, and browsing history while keeping your account.",
      benefit: "Clean slate without starting over"
    }
  ];

  const faqs = [
    {
      question: "How long does it take to delete my account?",
      answer: "Account deletion is immediate for deactivation, but there's a 30-day grace period before permanent deletion. You can cancel anytime during these 30 days by simply logging back in."
    },
    {
      question: "Can I recover my account after deletion?",
      answer: "Yes, but only within 30 days of deletion. After 30 days, the deletion becomes permanent and irreversible. All your data will be completely erased from our systems."
    },
    {
      question: "What happens to my pending orders?",
      answer: "Pending orders will continue to be processed. Your account deletion will be delayed until all orders are delivered, returns processed, and refunds completed."
    },
    {
      question: "Will I still receive emails after deletion?",
      answer: "You'll receive one final confirmation email about your account deletion. After 30 days, all email communications will stop, and your email will be removed from our database."
    },
    {
      question: "Can I delete my account if I'm a seller?",
      answer: "Yes, but you must first close your seller store, withdraw all pending payments, resolve customer disputes, and ensure no active orders. Contact seller support for assistance."
    },
    {
      question: "What data does Zuba House keep after deletion?",
      answer: "For legal and regulatory compliance, we retain minimal transaction records (order IDs, amounts, dates) for up to 7 years for tax and fraud prevention. All personal identifiers are removed."
    },
    {
      question: "Can someone else delete my account?",
      answer: "No. Account deletion requires password verification and email confirmation. If you suspect unauthorized access, change your password immediately and contact security@zubahouse.com."
    },
    {
      question: "What happens to my product reviews?",
      answer: "Reviews are anonymized (your name becomes 'Deleted User') but remain visible to help other shoppers. If you want reviews removed entirely, contact us before deleting your account."
    }
  ];

  return (
    <>
      <Helmet>
        <title>How to Delete Your Zuba House Account - Complete Guide</title>
        <meta name="description" content="Learn how to permanently delete your Zuba House account via website, mobile app, or email. Understand what data gets deleted, 30-day grace period, and alternatives to account deletion." />
        <meta name="keywords" content="delete Zuba House account, close account, remove account, deactivate account, account deletion guide, cancel account" />
        <link rel="canonical" href="https://zubahouse.com/delete-account" />
        <meta property="og:title" content="How to Delete Your Zuba House Account - Step-by-Step Guide" />
        <meta property="og:description" content="Complete guide to deleting your account on Zuba House. Learn about the 30-day grace period, what data gets deleted, and alternatives to deletion." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://zubahouse.com/delete-account" />
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
              <FaUserSlash className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Account Management</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              How to Delete Your Account
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 leading-relaxed"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              We&apos;re sorry to see you go. This guide will walk you through the complete account deletion process 
              on website, mobile app, or via email, including what happens to your data and how to recover your account.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a 
                href="#deletion-methods" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#efb291', color: '#0b2735' }}
              >
                <FaArrowRight className="inline mr-2" />
                Start Deletion Process
              </a>
              <a 
                href="#alternatives" 
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
              >
                See Alternatives
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Warning Banner */}
        {showWarning && (
          <motion.div 
            className="py-6 px-6"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', borderBottom: '2px solid rgba(220, 38, 38, 0.3)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="max-w-5xl mx-auto flex items-start gap-4">
              <FaExclamationTriangle className="text-3xl flex-shrink-0" style={{ color: '#ef4444' }} />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#ef4444' }}>
                  Important: Account Deletion is Permanent After 30 Days
                </h3>
                <p className="mb-3" style={{ color: '#e5e2db', opacity: 0.9 }}>
                  Once you delete your account, you have 30 days to change your mind. After this period, 
                  all your data will be permanently erased and cannot be recovered under any circumstances.
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: '#efb291' }}
                >
                  I understand
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Before You Delete Section */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Before You Delete Your Account
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Please complete these important steps before proceeding with account deletion
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beforeYouDelete.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl relative"
                  style={{ 
                    backgroundColor: '#0b2735', 
                    border: `2px solid ${item.important ? '#ef4444' : 'rgba(239, 178, 145, 0.2)'}` 
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: item.important ? '#ef4444' : '#efb291', y: -5 }}
                >
                  {item.important && (
                    <div 
                      className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#ef4444', color: '#fff' }}
                    >
                      IMPORTANT
                    </div>
                  )}
                  
                  <div className="text-4xl mb-4" style={{ color: item.important ? '#ef4444' : '#efb291' }}>
                    {item.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#e5e2db' }}>
                    {item.title}
                  </h3>
                  
                  <p className="mb-4 text-sm leading-relaxed" style={{ color: '#e5e2db', opacity: 0.85 }}>
                    {item.description}
                  </p>
                  
                  <div 
                    className="p-3 rounded-lg text-xs"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)', color: '#efb291' }}
                  >
                    <strong>Action:</strong> {item.action}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Deletion Methods */}
        <div id="deletion-methods" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Three Ways to Delete Your Account
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Choose your preferred method and follow the step-by-step instructions
            </p>

            {/* Method Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {deletionMethods.map((method) => (
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
                  <div className="text-left">
                    <div className="font-semibold">{method.title}</div>
                    <div className="text-xs" style={{ opacity: 0.8 }}>{method.platform}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Method Steps */}
            {deletionMethods.map((method) => (
              activeMethod === method.id && (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {method.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="relative p-6 md:p-8 rounded-2xl"
                      style={{ backgroundColor: '#1a3d52', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ borderColor: '#efb291', x: 5 }}
                    >
                      {/* Step Number Badge */}
                      <div 
                        className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                        style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                      >
                        {step.number}
                      </div>

                      <div className="flex items-start gap-6 ml-8">
                        {/* Icon */}
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                        >
                          {step.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3" style={{ color: '#e5e2db' }}>
                            {step.title}
                          </h3>
                          <p className="text-lg mb-4 leading-relaxed" style={{ color: '#e5e2db', opacity: 0.85 }}>
                            {step.description}
                          </p>
                          
                          {/* Tip */}
                          <div 
                            className="flex items-start gap-3 p-4 rounded-lg"
                            style={{ backgroundColor: 'rgba(239, 178, 145, 0.1)' }}
                          >
                            <FaInfoCircle className="flex-shrink-0 mt-1" style={{ color: '#efb291' }} />
                            <div>
                              <span className="font-semibold" style={{ color: '#efb291' }}>Tip: </span>
                              <span style={{ color: '#e5e2db', opacity: 0.9 }}>{step.tip}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Contact for Help */}
                  {method.id === 'email' && (
                    <motion.div
                      className="p-8 rounded-2xl text-center"
                      style={{ background: 'linear-gradient(135deg, #efb291 0%, #d4a077 100%)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h3 className="text-2xl font-bold mb-4" style={{ color: '#0b2735' }}>
                        Ready to Request Deletion?
                      </h3>
                      <p className="mb-6 text-lg" style={{ color: '#0b2735', opacity: 0.85 }}>
                        Send your account deletion request to our support team
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        <a 
                          href="mailto:contact@zubahouse.com?cc=info@zubahouse.com&subject=Account Deletion Request - [Your Email]&body=Hello Zuba House Support,%0D%0A%0D%0AI would like to request deletion of my account.%0D%0A%0D%0AFull Name: [Your Name]%0D%0ARegistered Email: [Your Email]%0D%0APhone Number: [If Applicable]%0D%0AReason for Deletion: [Optional]%0D%0A%0D%0AI understand that:%0D%0A- My account will be deactivated immediately%0D%0A- I have 30 days to cancel this request%0D%0A- After 30 days, all data will be permanently deleted%0D%0A%0D%0AThank you."
                          className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                          style={{ backgroundColor: '#0b2735', color: '#e5e2db' }}
                        >
                          <FaEnvelope className="inline mr-2" />
                          Send Deletion Request
                        </a>
                      </div>
                      <div className="mt-6 text-sm" style={{ color: '#0b2735', opacity: 0.7 }}>
                        <p className="mb-2">Email: contact@zubahouse.com (CC: info@zubahouse.com)</p>
                        <p>Phone: +1 (437) 557-7487</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* What Gets Deleted */}
        <div className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              What Gets Deleted
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Here&apos;s a complete breakdown of all data that will be permanently removed after 30 days
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whatGetsDeleted.map((category, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: '#0b2735', border: '2px solid rgba(220, 38, 38, 0.3)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#ef4444' }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#ef4444' }}
                    >
                      {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: '#e5e2db' }}>
                      {category.title}
                    </h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <FaTrashAlt className="flex-shrink-0 mt-1 text-sm" style={{ color: '#ef4444' }} />
                        <span style={{ color: '#e5e2db', opacity: 0.9 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-8 p-6 rounded-xl flex items-start gap-4"
              style={{ backgroundColor: '#0b2735', border: '1px solid rgba(239, 178, 145, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FaDatabase className="text-2xl flex-shrink-0" style={{ color: '#efb291' }} />
              <div>
                <h4 className="font-bold mb-2" style={{ color: '#efb291' }}>Data Retained for Legal Compliance</h4>
                <p style={{ color: '#e5e2db', opacity: 0.85 }}>
                  We retain minimal transaction data (order IDs, amounts, dates) for up to 7 years as required by tax laws 
                  and fraud prevention regulations. All personal identifiers are removed from these records.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Important Warnings */}
        <div className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Important Things to Know
            </h2>

            <div className="space-y-4">
              {importantWarnings.map((warning, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291' }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0" style={{ color: '#efb291' }}>
                      {warning.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#e5e2db' }}>
                        {warning.title}
                      </h3>
                      <p style={{ color: '#e5e2db', opacity: 0.85 }}>
                        {warning.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Alternatives Section */}
        <div id="alternatives" className="py-16 px-6" style={{ backgroundColor: 'rgba(239, 178, 145, 0.05)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#e5e2db' }}>
              Alternatives to Account Deletion
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#e5e2db', opacity: 0.8 }}>
              Consider these options before permanently deleting your account
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alternatives.map((alt, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: '#0b2735', border: '2px solid rgba(239, 178, 145, 0.2)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: '#efb291', y: -5 }}
                >
                  <div className="text-4xl mb-4" style={{ color: '#efb291' }}>
                    {alt.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#e5e2db' }}>
                    {alt.title}
                  </h3>
                  <p className="mb-4" style={{ color: '#e5e2db', opacity: 0.85 }}>
                    {alt.description}
                  </p>
                  <div 
                    className="px-4 py-2 rounded-lg inline-block"
                    style={{ backgroundColor: 'rgba(239, 178, 145, 0.2)', color: '#efb291' }}
                  >
                    <FaCheckCircle className="inline mr-2" />
                    {alt.benefit}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#e5e2db' }}>
              Account Deletion FAQs
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
              style={{ background: 'linear-gradient(135deg, #1a3d52 0%, #0b2735 100%)', border: '2px solid #efb291' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FaQuestionCircle className="text-5xl mx-auto mb-6" style={{ color: '#efb291' }} />
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#e5e2db' }}>
                Have Questions About Account Deletion?
              </h2>
              <p className="text-xl mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Our support team is here to help answer any questions or concerns before you delete your account
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="mailto:contact@zubahouse.com?cc=info@zubahouse.com&subject=Question About Account Deletion"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                >
                  <FaEnvelope className="inline mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+14375577487"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
                >
                  <FaPhone className="inline mr-2" />
                  Call Us
                </a>
              </div>
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(239, 178, 145, 0.2)' }}>
                <p className="text-sm" style={{ color: '#e5e2db', opacity: 0.7 }}>
                  Email: contact@zubahouse.com (CC: info@zubahouse.com) • Phone: +1 (437) 557-7487
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;


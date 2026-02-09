import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFileContract, 
  FaShieldAlt, 
  FaExclamationTriangle,
  FaGavel,
  FaUserShield,
  FaStore,
  FaCreditCard,
  FaShippingFast,
  FaUndo,
  FaBan,
  FaEnvelope
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const TermsOfUse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <FaUserShield />,
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using Zuba House (zubahouse.com) and our mobile applications, you accept and agree to be bound by these Terms of Use.",
        "If you do not agree to these terms, please do not use our services.",
        "We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of modified terms.",
        "You must be at least 18 years old or have parental consent to use our services."
      ]
    },
    {
      icon: <FaStore />,
      title: "2. Use of Services",
      content: [
        "Zuba House is a marketplace connecting buyers with sellers of authentic African fashion, art, and home décor.",
        "You agree to use our services only for lawful purposes and in accordance with these Terms.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You must not use our platform for any fraudulent, illegal, or unauthorized purposes.",
        "Multiple accounts by the same user without authorization are prohibited."
      ]
    },
    {
      icon: <FaShieldAlt />,
      title: "3. User Accounts",
      content: [
        "Account registration requires accurate, current, and complete information.",
        "You are responsible for all activities under your account.",
        "Notify us immediately of any unauthorized use of your account at security@zubahouse.com.",
        "We reserve the right to suspend or terminate accounts that violate these Terms.",
        "Account deletion can be requested through your account settings or by contacting us."
      ]
    },
    {
      icon: <FaShippingFast />,
      title: "4. Product Listings & Purchases",
      content: [
        "Product descriptions, images, and prices are provided by sellers and verified by Zuba House.",
        "We strive for accuracy but do not guarantee that all information is error-free.",
        "Prices are subject to change without notice until purchase is confirmed.",
        "All purchases are subject to product availability.",
        "By placing an order, you agree to pay the listed price plus applicable taxes and shipping fees."
      ]
    },
    {
      icon: <FaCreditCard />,
      title: "5. Payment & Pricing",
      content: [
        "Payment is processed securely through our authorized payment partners.",
        "We accept major credit cards, debit cards, PayPal, and other listed payment methods.",
        "All prices are in USD unless otherwise stated.",
        "You authorize us to charge your selected payment method for all purchases.",
        "Promotional codes and discounts are subject to specific terms and expiration dates.",
        "Taxes and duties for international orders are the buyer's responsibility."
      ]
    },
    {
      icon: <FaShippingFast />,
      title: "6. Shipping & Delivery",
      content: [
        "Shipping times vary by location and selected shipping method (3-14 business days).",
        "Processing time is 1-2 business days before shipment.",
        "We ship to 50+ countries worldwide.",
        "Risk of loss passes to you upon delivery to the carrier.",
        "Customs delays, taxes, and duties are not included in shipping costs.",
        "Zuba House is not responsible for delays caused by customs, weather, or carrier issues."
      ]
    },
    {
      icon: <FaUndo />,
      title: "7. Returns & Refunds",
      content: [
        "Returns are accepted within 30 days of delivery for eligible items.",
        "Items must be unused, in original packaging, and in resalable condition.",
        "Return shipping costs are the buyer's responsibility unless the item is defective.",
        "Refunds are processed within 5-7 business days after receiving the returned item.",
        "Custom or personalized items are not eligible for return.",
        "Sale and clearance items may have different return policies (marked at purchase).",
        "For detailed return instructions, visit our Return & Refund Policy page."
      ]
    },
    {
      icon: <FaStore />,
      title: "8. Seller Responsibilities",
      content: [
        "Sellers must provide authentic, accurately described products.",
        "Sellers are responsible for timely order fulfillment and shipping.",
        "Sellers must comply with all applicable laws and regulations.",
        "Zuba House reserves the right to remove sellers who violate our policies.",
        "Commission fees apply to all sales (12-15% standard, 10% for artisans)."
      ]
    },
    {
      icon: <FaShieldAlt />,
      title: "9. Intellectual Property",
      content: [
        "All content on Zuba House (logos, text, images, designs) is protected by copyright and trademark laws.",
        "You may not reproduce, distribute, or create derivative works without our written permission.",
        "Product images and descriptions are the property of their respective sellers.",
        "User-generated content (reviews, photos) grants Zuba House a non-exclusive license to use for promotional purposes.",
        "Report intellectual property violations to legal@zubahouse.com."
      ]
    },
    {
      icon: <FaBan />,
      title: "10. Prohibited Activities",
      content: [
        "Using the platform for illegal activities or fraud.",
        "Posting false, misleading, or defamatory content.",
        "Attempting to circumvent security measures or access unauthorized areas.",
        "Harassing, threatening, or impersonating other users or staff.",
        "Scraping, data mining, or automated collection of information.",
        "Reselling products without authorization from original sellers.",
        "Uploading viruses, malware, or harmful code."
      ]
    },
    {
      icon: <FaExclamationTriangle />,
      title: "11. Disclaimers & Limitations of Liability",
      content: [
        "Zuba House is provided 'as is' without warranties of any kind, express or implied.",
        "We do not guarantee uninterrupted, secure, or error-free service.",
        "We are not responsible for disputes between buyers and sellers (though we facilitate resolutions).",
        "Our liability is limited to the amount you paid for the specific transaction in question.",
        "We are not liable for indirect, incidental, or consequential damages.",
        "Some jurisdictions do not allow limitation of liability, so these may not apply to you."
      ]
    },
    {
      icon: <FaGavel />,
      title: "12. Dispute Resolution & Governing Law",
      content: [
        "These Terms are governed by the laws of Canada (Province of Quebec).",
        "Disputes will first be addressed through good-faith negotiation.",
        "If unresolved, disputes may be submitted to binding arbitration in Gatineau, Quebec, Canada.",
        "You waive the right to participate in class action lawsuits.",
        "Small claims court remains available for qualifying disputes.",
        "Contact us at legal@zubahouse.com for dispute resolution."
      ]
    },
    {
      icon: <FaFileContract />,
      title: "13. Termination",
      content: [
        "We may suspend or terminate your access for violations of these Terms.",
        "You may terminate your account at any time through account settings.",
        "Upon termination, all licenses and rights granted to you will cease.",
        "Provisions regarding liability, disclaimers, and dispute resolution survive termination.",
        "Outstanding orders and obligations remain enforceable after termination."
      ]
    },
    {
      icon: <FaEnvelope />,
      title: "14. Contact Information",
      content: [
        "For questions about these Terms of Use, contact us:",
        "Email: legal@zubahouse.com",
        "CC: info@zubahouse.com",
        "Phone: +1 (437) 557-7487",
        "Address: 119 Chem Rivermead, Gatineau, QC J9H 5W5, Canada",
        "Business Hours: Monday-Friday, 9 AM - 5 PM EST"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Use - Zuba House | Legal Terms & Conditions</title>
        <meta name="description" content="Read Zuba House's Terms of Use. Understand your rights and responsibilities when using our marketplace for authentic African fashion, art, and home décor." />
        <meta name="keywords" content="Zuba House terms of use, terms and conditions, legal terms, user agreement, marketplace terms" />
        <link rel="canonical" href="https://zubahouse.com/terms" />
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
              <FaFileContract className="inline mr-2" style={{ color: '#efb291' }} />
              <span style={{ color: '#efb291' }} className="font-semibold">Legal Agreement</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: '#e5e2db' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Terms of Use
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-4"
              style={{ color: '#e5e2db', opacity: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Please read these terms carefully before using Zuba House
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
              <FaExclamationTriangle className="text-3xl flex-shrink-0" style={{ color: '#efb291' }} />
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#efb291' }}>
                  Important Notice
                </h3>
                <p style={{ color: '#e5e2db', opacity: 0.9 }}>
                  These Terms of Use constitute a legally binding agreement between you and Zuba House. 
                  By using our website or mobile app, you agree to comply with and be bound by these terms. 
                  If you do not agree, please do not use our services.
                </p>
              </div>
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
                  <div className="space-y-4 ml-16">
                    {section.content.map((paragraph, i) => (
                      <p 
                        key={i} 
                        className="text-base leading-relaxed"
                        style={{ color: '#e5e2db', opacity: 0.9 }}
                      >
                        {paragraph}
                      </p>
                    ))}
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
                Questions About Our Terms?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#e5e2db', opacity: 0.8 }}>
                Contact our legal team for clarification or concerns
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="mailto:legal@zubahouse.com?cc=info@zubahouse.com"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#efb291', color: '#0b2735' }}
                >
                  <FaEnvelope className="inline mr-2" />
                  Email Legal Team
                </a>
                <a 
                  href="/support-center"
                  className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'transparent', color: '#e5e2db', border: '2px solid #efb291' }}
                >
                  Contact Support
                </a>
              </div>
              <div className="mt-8 text-sm" style={{ color: '#e5e2db', opacity: 0.7 }}>
                <p>Email: legal@zubahouse.com (CC: info@zubahouse.com)</p>
                <p className="mt-2">Phone: +1 (437) 557-7487</p>
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
                { title: 'Consumer Health Data', link: '/consumer-health-data-privacy' },
                { title: 'Privacy Choices', link: '/privacy-choices' }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="p-6 rounded-xl text-center transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#1a3d52', border: '1px solid rgba(239, 178, 145, 0.2)' }}
                >
                  <p className="font-semibold" style={{ color: '#efb291' }}>{item.title}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;


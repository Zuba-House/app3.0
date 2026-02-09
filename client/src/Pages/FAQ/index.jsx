import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaShoppingCart,
  FaUserPlus,
  FaCreditCard,
  FaShippingFast,
  FaUndo,
  FaHeart,
  FaGlobe,
  FaHeadset,
  FaTags,
  FaTshirt,
  FaLock,
  FaStar,
  FaPalette,
  FaMobileAlt,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  const faqCategories = [
    {
      category: "General",
      icon: <FaQuestionCircle className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "What products does Zuba House offer?",
          answer: "Zuba House offers a wide range of authentic African products including traditional clothing, handcrafted jewelry, home decor, art pieces, beauty products, and accessories. We connect African artisans with customers worldwide, bringing you unique, high-quality products that celebrate African culture and craftsmanship."
        },
        {
          question: "Does Zuba House collaborate with local artisans or offer customized products?",
          answer: "Yes! Zuba House proudly collaborates with talented African artisans and craftspeople across the continent. We work directly with local artisans to bring their authentic creations to a global market. For customized products, please contact our customer support team at info@zubahouse.com to discuss your specific requirements. Custom orders may require additional time and costs depending on the complexity of the request."
        }
      ]
    },
    {
      category: "Account & Orders",
      icon: <FaUserPlus className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "How can I create an account on Zuba House?",
          answer: "Creating an account is easy! Click on the 'Sign Up' or 'Register' button at the top right of the page. Fill in your name, email address, and create a secure password. You'll receive a verification email to activate your account. You can also create an account through our mobile app, available for download on iOS and Android."
        },
        {
          question: "Do I need to create an account to place an order?",
          answer: "Yes, you need to create an account to place an order. Creating an account offers many benefits such as order tracking, wishlist features, faster checkout, exclusive app-only discounts, and easier returns. Registration is quick and easy - just provide your name, email, and create a password."
        },
        {
          question: "How do I reset my account password?",
          answer: "To reset your password, click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password. If you don't receive the email within a few minutes, check your spam folder or contact support."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order ships, you'll receive an email with a tracking number and link. You can also track your order by logging into your account and visiting the 'My Orders' section. Click on the specific order to view real-time tracking information. Our mobile app provides push notifications for order updates and faster tracking access."
        },
        {
          question: "Can I modify or cancel my order after placing it?",
          answer: "Orders can be modified or cancelled within 2 hours of placement. After this window, orders are processed and shipped quickly. To modify or cancel, contact our customer support immediately at sales@zubahouse.com with your order number. Once an order has shipped, it cannot be cancelled, but you may return it according to our return policy."
        }
      ]
    },
    {
      category: "Payment & Security",
      icon: <FaCreditCard className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "What payment methods are accepted at Zuba House?",
          answer: "We accept multiple payment methods including major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and other secure payment options. All transactions are processed through encrypted, secure payment gateways to protect your information. Payment methods may vary by region."
        },
        {
          question: "How secure is my personal and payment information on Zuba House?",
          answer: "Your security is our top priority. Zuba House uses industry-standard SSL encryption to protect all personal and payment information. We are PCI DSS compliant and never store your complete credit card information on our servers. All payment processing is handled by trusted, certified payment providers. Your data is encrypted and securely stored in compliance with international data protection regulations."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      icon: <FaShippingFast className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "What is Zuba House's shipping policy?",
          answer: "We offer free international shipping on orders over $100. Standard shipping typically takes 7-14 business days, depending on your location. Express shipping options are available at checkout for faster delivery. Shipping times may vary during peak seasons or due to customs processing. You'll receive tracking information once your order ships."
        },
        {
          question: "Does Zuba House offer international shipping?",
          answer: "Yes! Zuba House ships to customers worldwide. We deliver to over 50 countries across North America, Europe, Asia, Australia, and beyond. Shipping costs and delivery times vary by destination. International orders may be subject to customs duties and taxes, which are the responsibility of the customer. Check our shipping calculator at checkout for specific rates to your country."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      icon: <FaUndo className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "What is Zuba House's return and refund policy?",
          answer: "We offer a 30-day return policy for most items. Products must be unused, in original condition with tags attached, and in original packaging. To be eligible for a refund, you must contact us within 30 days of delivery. Defective or incorrect items receive free return shipping. Original shipping costs are non-refundable unless the return is due to our error. For full details, visit our Return & Refund Policy page."
        },
        {
          question: "How do I initiate a return or exchange?",
          answer: "To initiate a return: (1) Email sales@zubahouse.com within 30 days of delivery with your order number and reason for return. (2) Wait for a Return Authorization (RA) number and instructions (24-48 hours). (3) Pack the item securely with the RA number visible on the package. (4) Ship to: Zuba House Returns, 119 Chem Rivermead, Gatineau, QC J9H 5W5, Canada. (5) Refunds are processed within 5-7 business days after we receive and inspect your return. We do not offer direct exchanges - please return for a refund and place a new order."
        }
      ]
    },
    {
      category: "Features & Shopping",
      icon: <FaHeart className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "How do I add items to my wishlist?",
          answer: "To add items to your wishlist, simply click the heart icon on any product page. You must be logged into your account to use the wishlist feature. Your wishlist is saved and accessible from any device when you log in. You can view and manage your wishlist by clicking the heart icon in the top navigation menu. The mobile app offers additional wishlist features including price drop alerts."
        },
        {
          question: "How can I leave a review for a product I purchased?",
          answer: "We value your feedback! To leave a review: (1) Log into your account and go to 'My Orders'. (2) Find the product you want to review and click 'Write a Review'. (3) Rate the product (1-5 stars) and write your detailed feedback. (4) Optionally add photos of the product. (5) Submit your review. Reviews are typically published within 24-48 hours after moderation. Your honest reviews help other customers and support our artisan partners."
        },
        {
          question: "What sizes are available for clothing and footwear?",
          answer: "Zuba House offers a wide range of sizes for clothing and footwear. Size availability varies by product and artisan. Each product page includes a detailed size chart with measurements in both inches and centimeters. We recommend checking the specific size chart for each item, as sizing may vary between different artisans and regions. If you need assistance with sizing, contact our customer support team."
        }
      ]
    },
    {
      category: "Promotions & Discounts",
      icon: <FaTags className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "Are there any ongoing promotions or discounts?",
          answer: "Yes! Zuba House regularly offers promotions, seasonal sales, and exclusive discounts. The best deals and exclusive offers are available through our mobile app - download it to access app-only discounts, early access to sales, and special promotions. Subscribe to our newsletter to receive updates on upcoming sales. Follow us on social media for flash sales and limited-time offers. Check our homepage for current promotions."
        },
        {
          question: "How do I apply a promo code to my order?",
          answer: "To apply a promo code: (1) Add your desired items to the cart. (2) Proceed to checkout. (3) Look for the 'Promo Code' or 'Discount Code' field. (4) Enter your promo code exactly as provided. (5) Click 'Apply' to see the discount reflected in your total amount. Ensure that the promo code is valid, not expired, and meets the terms and conditions (minimum purchase amount, specific products, etc.). Only one promo code can be used per order. App users often receive exclusive promo codes for additional savings."
        }
      ]
    },
    {
      category: "Customer Support",
      icon: <FaHeadset className="text-[30px] text-[#efb291]" />,
      faqs: [
        {
          question: "How can I contact Zuba House's customer support?",
          answer: "We're here to help! Contact us through: Email: sales@zubahouse.com or info@zubahouse.com (we respond within 24 hours). Phone: +1 (437) 557-7487 (business hours). Live Chat: Available on our website and mobile app during business hours. Contact Form: Visit our Contact Us page. Social Media: Message us on Instagram, Facebook, or Twitter. Our mobile app offers the fastest support response with in-app messaging and priority customer service for app users."
        }
      ]
    }
  ];

  const quickLinks = [
    { icon: <FaMobileAlt />, title: "Download Our App", description: "Get exclusive discounts", link: "/download-app" },
    { icon: <FaShippingFast />, title: "Shipping Info", description: "Delivery details", link: "/shipping-info" },
    { icon: <FaUndo />, title: "Return Policy", description: "Easy returns", link: "/return-refund-policy" },
    { icon: <FaHeadset />, title: "Contact Support", description: "We're here to help", link: "/contact" }
  ];

  return (
    <div className="faq-page bg-white">
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
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <FaQuestionCircle className="text-[#efb291]" />
              <p className="text-[#efb291] text-sm font-medium">
                Your Questions Answered
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Frequently Asked <span className="text-[#efb291]">Questions</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Find answers to common questions about shopping at Zuba House, our products,
              shipping, returns, and more. Can't find what you're looking for? Contact our support team.
            </motion.p>

          </motion.div>
        </div>
      </motion.section>

      {/* Quick Links Section */}
      <motion.section
        className="py-12 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <Link
                  to={link.link}
                  className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-[#efb291] group"
                >
                  <div className="text-[#0b2735] group-hover:text-[#efb291] transition-colors text-3xl mb-3 flex justify-center">
                    {link.icon}
                  </div>
                  <h3 className="text-center font-bold text-[#0b2735] mb-1">{link.title}</h3>
                  <p className="text-center text-sm text-gray-600">{link.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* App Promotion Banner */}
      <motion.section
        className="py-12 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-[rgba(239,178,145,0.1)] border-2 border-[#efb291] rounded-2xl p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-[#efb291] text-[#0b2735] rounded-full w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <FaMobileAlt className="text-4xl" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#efb291] mb-2">
                    Download the Zuba House App
                  </h3>
                  <p className="text-[#e5e2db] mb-4">
                    Get exclusive app-only discounts, early access to sales, price drop alerts,
                    faster checkout, and priority customer support. Many special offers and promotions
                    are only available through our mobile app!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Link
                      to="/download-app"
                      className="bg-[#efb291] text-[#0b2735] px-6 py-3 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all inline-block"
                    >
                      Download Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Categories */}
      {faqCategories.map((category, categoryIndex) => (
        <motion.section
          key={categoryIndex}
          className="py-16 lg:py-20 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-5xl mx-auto"
              variants={fadeInUp}
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center">
                  {category.icon}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2735]">
                  {category.category}
                </h2>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = `${categoryIndex}-${faqIndex}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <motion.div
                      key={faqIndex}
                      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:border-[#efb291] transition-all"
                      variants={fadeInUp}
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <FaQuestionCircle className="text-[#efb291] text-xl flex-shrink-0 mt-1" />
                          <h3 className="text-lg font-bold text-[#0b2735] pr-4">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="text-[#efb291] text-xl flex-shrink-0">
                          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </button>

                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6"
                        >
                          <div className="pl-10 pr-4">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.section>
      ))}

      {/* Still Have Questions CTA */}
      <motion.section
        className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-6"
              variants={fadeInUp}
            >
              Still Have <span className="text-[#efb291]">Questions?</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Can't find the answer you're looking for? Our friendly customer support team
              is here to help you with any questions or concerns.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="mailto:sales@zubahouse.com"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3 group"
              >
                <FaHeadset className="group-hover:scale-110 transition-transform" />
                Contact Support
              </a>
              <Link
                to="/contact"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                Visit Help Center
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              variants={fadeInUp}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <FaHeadset className="text-[#efb291]" />
                  <span>Email: sales@zubahouse.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeadset className="text-[#efb291]" />
                  <span>Phone: +1 (437) 557-7487</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default FAQ;

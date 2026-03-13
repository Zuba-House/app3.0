/**
 * Help & Support Screen
 * FAQs, contact options, and customer support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I place an order?',
    answer: 'Browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account for faster checkout next time.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and digital payment methods through our secure payment gateway.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Zuba House. Delivery times depend on your location: Canada 1-5 business days, USA 4-7 business days. Zuba House Express is available at checkout for faster delivery.',
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can track your order in the "Orders" section of the app.',
  },
  {
    question: 'What is your return policy?',
    answer: '30-day free returns on unused items in original packaging. We do not accept returns after 30 days. Tap "Return Policy" on any product page for full details.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can reach us via email at support@zubahouse.com, call us at +1 (555) 123-4567, or use the contact form below. We typically respond within 24 hours.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we ship within Canada and the United States. International shipping options are coming soon!',
  },
  {
    question: 'How do I change or cancel my order?',
    answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer support immediately.',
  },
];

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@zubahouse.com?subject=Customer Support Request');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+15551234567');
  };

  const handleContactWhatsApp = () => {
    Linking.openURL('https://wa.me/15551234567');
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.sectionSubtitle}>We're here to help! Contact us anytime.</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleContactEmail}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail-outline" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@zubahouse.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleContactPhone}>
            <View style={styles.contactIcon}>
              <Ionicons name="call-outline" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactSubtitle}>+1 (555) 123-4567</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleContactWhatsApp}>
            <View style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSubtitle}>Chat with us instantly</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => navigation.navigate('ReturnPolicy')}>
            <View style={styles.contactIcon}>
              <Ionicons name="return-down-back-outline" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Return Policy</Text>
              <Text style={styles.contactSubtitle}>30-day free returns · No returns after 30 days</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => navigation.navigate('SafePaymentsPrivacy')}>
            <View style={styles.contactIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Safe Payments & Privacy</Text>
              <Text style={styles.contactSubtitle}>Encrypted payments · We protect your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>Find answers to common questions</Text>

          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqCard}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 6:00 PM EST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 4:00 PM EST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={styles.hoursTime}>Closed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
  faqCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  hoursCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hoursDay: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  hoursTime: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.7,
  },
});

export default HelpSupportScreen;

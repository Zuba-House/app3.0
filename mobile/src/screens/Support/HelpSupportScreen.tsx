/**
 * Help & Support — FAQ and contact
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
import * as WebBrowser from 'expo-web-browser';
import Colors from '../../constants/colors';
import { APP_VERSION, SOCIAL_LINKS } from '../../constants/config';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I track my order?',
    answer:
      'Go to the Orders tab, tap your order to see the current status and tracking info.',
  },
  {
    question: 'How do I return a product?',
    answer: 'Contact us at support@zubahouse.com within 7 days of delivery.',
  },
  {
    question: 'How do I apply a coupon?',
    answer:
      'Add items to cart, go to checkout, and enter your coupon code in the Promo Code field.',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Yes. Payments are processed by Stripe, a PCI-compliant payment provider.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'Contact us immediately after placing the order at support@zubahouse.com.',
  },
];

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick help</Text>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
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
            {expandedFAQ === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Contact us</Text>
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() =>
            Linking.openURL(
              'mailto:support@zubahouse.com?subject=Support Request — Zuba House App'
            )
          }
        >
          <Ionicons name="mail-outline" size={24} color={Colors.secondary} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email support</Text>
            <Text style={styles.contactSubtitle}>support@zubahouse.com</Text>
          </View>
        </TouchableOpacity>

        {SOCIAL_LINKS.whatsapp ? (
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL(SOCIAL_LINKS.whatsapp)}
          >
            <Ionicons name="logo-whatsapp" size={24} color={Colors.secondary} />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSubtitle}>Chat with us</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => WebBrowser.openBrowserAsync(SOCIAL_LINKS.instagram)}
        >
          <Ionicons name="logo-instagram" size={24} color={Colors.secondary} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Instagram DM</Text>
            <Text style={styles.contactSubtitle}>@zuba_house</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Report a bug</Text>
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() =>
            Linking.openURL(
              `mailto:support@zubahouse.com?subject=${encodeURIComponent(
                `Bug Report — Zuba House App v${APP_VERSION}`
              )}`
            )
          }
        >
          <Ionicons name="bug-outline" size={24} color={Colors.secondary} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Found something broken?</Text>
            <Text style={styles.contactSubtitle}>Send us details</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  headerPlaceholder: { width: 40 },
  scrollView: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: Colors.primary, flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 14, color: Colors.primary, opacity: 0.75, marginTop: 12, lineHeight: 20 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactText: { marginLeft: 12, flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  contactSubtitle: { fontSize: 13, color: Colors.primary, opacity: 0.6, marginTop: 2 },
});

export default HelpSupportScreen;

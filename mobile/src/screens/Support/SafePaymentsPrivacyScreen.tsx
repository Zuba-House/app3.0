/**
 * Safe Payments & Privacy Screen
 * Explains payment security and privacy protection
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

const SafePaymentsPrivacyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safe Payments & Privacy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.secondary} />
            <Text style={styles.badgeText}>Safe Payments</Text>
          </View>
          <Text style={styles.paragraph}>
            Your payment information is protected with industry-standard encryption. We use a secure payment processor so your card details are never stored on our servers.
          </Text>
          <Text style={styles.paragraph}>
            • All transactions are encrypted end-to-end.{'\n'}
            • We accept major credit and debit cards through our secure gateway.{'\n'}
            • Your financial data is never sold or shared for marketing.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Ionicons name="lock-closed" size={22} color={Colors.secondary} />
            <Text style={styles.badgeText}>Privacy Protection</Text>
          </View>
          <Text style={styles.paragraph}>
            Zuba House is committed to protecting your privacy. We collect only what we need to process orders, improve your experience, and communicate with you.
          </Text>
          <Text style={styles.paragraph}>
            • We do not sell your personal information to third parties.{'\n'}
            • Account and order data are stored securely and used only as described in our policies.{'\n'}
            • You can request access to or deletion of your data by contacting support.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Questions?</Text>
          <Text style={styles.paragraph}>
            For payment or privacy questions, contact us at support@zubahouse.com or use Help & Support in the app.
          </Text>
        </View>

        <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 8,
  },
});

export default SafePaymentsPrivacyScreen;

/**
 * Return Policy Screen
 * Full return policy: 30-day free returns, no returns after 30 days
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

const ReturnPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Ionicons name="return-down-back" size={22} color={Colors.secondary} />
            <Text style={styles.badgeText}>30-Day Free Returns</Text>
          </View>
          <Text style={styles.paragraph}>
            You may return most unused items in original packaging within <Text style={styles.bold}>30 days</Text> of delivery for a full refund or exchange. Returns are free when you use our prepaid label or return method.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>After 30 days</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do not accept returns or exchanges after 30 days</Text> from the delivery date. Please ensure you request a return within the return window if you change your mind.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conditions</Text>
          <Text style={styles.paragraph}>
            • Items must be unused, unwashed, and in original condition with tags attached.{'\n'}
            • Original packaging should be intact where possible.{'\n'}
            • Some items (e.g. perishables, personal care) may be non-returnable.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How to return</Text>
          <Text style={styles.paragraph}>
            Start a return from your order in the app or contact support. We’ll provide return instructions and a label when applicable. Refunds are processed within 5–10 business days after we receive the item.
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
  },
  bold: {
    fontWeight: '700',
  },
});

export default ReturnPolicyScreen;

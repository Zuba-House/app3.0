/**
 * About Zuba House Screen
 * Company information, mission, and app details
 */

import React from 'react';
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

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleWebsite = () => {
    Linking.openURL('https://zubahouse.com');
  };

  const handleSocialMedia = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: 'https://facebook.com/zubahouse',
      instagram: 'https://instagram.com/zubahouse',
      twitter: 'https://twitter.com/zubahouse',
    };
    if (urls[platform]) {
      Linking.openURL(urls[platform]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Zuba House</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo/Title Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ZH</Text>
          </View>
          <Text style={styles.appName}>Zuba House</Text>
          <Text style={styles.tagline}>Your Favorite African Fashion Marketplace</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Zuba House is dedicated to bringing you the finest African fashion, accessories, and 
            lifestyle products. We connect customers with authentic, high-quality items from across 
            the continent, making African fashion accessible to everyone.
          </Text>
        </View>

        {/* What We Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Authentic African Fashion & Accessories</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Fast & Secure Checkout</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Reliable Shipping & Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>24/7 Customer Support</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Easy Returns & Exchanges</Text>
            </View>
          </View>
        </View>

        {/* Contact & Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          
          <TouchableOpacity style={styles.linkCard} onPress={handleWebsite}>
            <Ionicons name="globe-outline" size={24} color={Colors.secondary} />
            <Text style={styles.linkText}>www.zubahouse.com</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia('facebook')}
              >
                <Ionicons name="logo-facebook" size={24} color={Colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia('instagram')}
              >
                <Ionicons name="logo-instagram" size={24} color={Colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialMedia('twitter')}
              >
                <Ionicons name="logo-twitter" size={24} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkCard}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard}>
            <Text style={styles.linkText}>Return Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Zuba House. All rights reserved.</Text>
          <Text style={styles.footerText}>Made with ❤️ for African Fashion Lovers</Text>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.5,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.primary,
    opacity: 0.8,
    lineHeight: 22,
  },
  featureList: {
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.primary,
    marginLeft: 12,
    flex: 1,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  linkText: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    marginLeft: 12,
  },
  socialSection: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
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
  socialTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default AboutScreen;

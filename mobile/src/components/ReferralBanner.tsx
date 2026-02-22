/**
 * Referral Banner Component - TEMU Style
 * Encourage users to invite friends
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface ReferralBannerProps {
  rewardAmount?: number;
}

const ReferralBanner: React.FC<ReferralBannerProps> = ({
  rewardAmount = 10,
}) => {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join Zuba House and get $${rewardAmount} off your first order! Download now: https://zubahouse.com/app`,
        title: 'Share Zuba House',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          'Shared!',
          `Thanks for sharing! You'll earn $${rewardAmount} when your friend makes their first purchase.`
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleShare}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift" size={32} color={Colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Invite Friends, Earn ${rewardAmount}</Text>
          <Text style={styles.subtitle}>
            Share the love! Get ${rewardAmount} credit for each friend who joins
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color={Colors.white} />
        </View>
      </View>
      
      {/* Decorative elements */}
      <View style={[styles.confetti, styles.confetti1]} />
      <View style={[styles.confetti, styles.confetti2]} />
      <View style={[styles.confetti, styles.confetti3]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.85,
    lineHeight: 18,
  },
  arrowContainer: {
    padding: 4,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    opacity: 0.6,
  },
  confetti1: {
    top: 8,
    right: 40,
  },
  confetti2: {
    top: 20,
    right: 60,
    width: 6,
    height: 6,
  },
  confetti3: {
    bottom: 10,
    right: 80,
    width: 10,
    height: 10,
    opacity: 0.4,
  },
});

export default ReferralBanner;

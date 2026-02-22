/**
 * Daily Check-In Component - TEMU Style
 * Gamification feature for user engagement
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DayReward {
  day: number;
  points: number;
  bonus?: string;
  claimed: boolean;
}

const DailyCheckIn: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todayClaimed, setTodayClaimed] = useState(false);
  const [points, setPoints] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0));

  const rewards: DayReward[] = [
    { day: 1, points: 10, claimed: streak >= 1 },
    { day: 2, points: 15, claimed: streak >= 2 },
    { day: 3, points: 20, claimed: streak >= 3 },
    { day: 4, points: 25, bonus: '5% OFF', claimed: streak >= 4 },
    { day: 5, points: 30, claimed: streak >= 5 },
    { day: 6, points: 40, claimed: streak >= 6 },
    { day: 7, points: 100, bonus: 'FREE SHIPPING', claimed: streak >= 7 },
  ];

  useEffect(() => {
    loadCheckInData();
  }, []);

  const loadCheckInData = async () => {
    try {
      const lastCheckIn = await AsyncStorage.getItem('lastCheckIn');
      const savedStreak = await AsyncStorage.getItem('checkInStreak');
      const savedPoints = await AsyncStorage.getItem('rewardPoints');

      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedPoints) setPoints(parseInt(savedPoints));

      const today = new Date().toDateString();
      if (lastCheckIn === today) {
        setTodayClaimed(true);
      } else {
        // Check if streak should reset (more than 1 day missed)
        if (lastCheckIn) {
          const lastDate = new Date(lastCheckIn);
          const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            setStreak(0);
            await AsyncStorage.setItem('checkInStreak', '0');
          }
        }
      }
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  const handleCheckIn = async () => {
    if (todayClaimed) return;

    const newStreak = (streak % 7) + 1;
    const reward = rewards[newStreak - 1];
    const newPoints = points + reward.points;

    // Animate
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Save data
    try {
      await AsyncStorage.setItem('lastCheckIn', new Date().toDateString());
      await AsyncStorage.setItem('checkInStreak', newStreak.toString());
      await AsyncStorage.setItem('rewardPoints', newPoints.toString());
    } catch (error) {
      console.error('Error saving check-in:', error);
    }

    setStreak(newStreak);
    setPoints(newPoints);
    setTodayClaimed(true);
  };

  const renderRewardDay = (reward: DayReward, isToday: boolean) => {
    const isClaimed = reward.claimed || (isToday && todayClaimed);
    const isNext = !reward.claimed && !isToday;

    return (
      <View
        key={reward.day}
        style={[
          styles.dayContainer,
          isToday && styles.dayToday,
          isClaimed && styles.dayClaimed,
        ]}
      >
        <Text style={[styles.dayLabel, isClaimed && styles.dayLabelClaimed]}>
          Day {reward.day}
        </Text>
        <View style={[styles.rewardCircle, isClaimed && styles.rewardCircleClaimed]}>
          {isClaimed ? (
            <Ionicons name="checkmark" size={20} color={Colors.white} />
          ) : (
            <Text style={styles.rewardPoints}>+{reward.points}</Text>
          )}
        </View>
        {reward.bonus && (
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>{reward.bonus}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Check-In Banner */}
      <TouchableOpacity
        style={styles.banner}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.bannerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="gift" size={24} color={Colors.secondary} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Daily Check-In</Text>
            <Text style={styles.bannerSubtitle}>
              {todayClaimed
                ? `${streak} day streak! Come back tomorrow`
                : 'Claim your daily reward!'}
            </Text>
          </View>
        </View>
        <View style={styles.bannerRight}>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.pointsText}>{points}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Check-In Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Check-In Rewards</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Points Display */}
            <View style={styles.pointsDisplay}>
              <Ionicons name="star" size={32} color="#FFD700" />
              <Text style={styles.totalPoints}>{points}</Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>

            {/* Streak Info */}
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={20} color="#FF5722" />
              <Text style={styles.streakText}>{streak} Day Streak</Text>
            </View>

            {/* Rewards Grid */}
            <View style={styles.rewardsGrid}>
              {rewards.map((reward, index) => {
                const currentDay = (streak % 7) + 1;
                const isToday = reward.day === currentDay && !todayClaimed;
                return renderRewardDay(reward, isToday);
              })}
            </View>

            {/* Check-In Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.checkInButton,
                  todayClaimed && styles.checkInButtonDisabled,
                ]}
                onPress={handleCheckIn}
                disabled={todayClaimed}
              >
                {todayClaimed ? (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                    <Text style={styles.checkInButtonText}>Claimed Today!</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="gift" size={24} color={Colors.white} />
                    <Text style={styles.checkInButtonText}>Check In Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Info Text */}
            <Text style={styles.infoText}>
              Check in daily to earn points! Complete 7 days for bonus rewards.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.7,
    marginTop: 2,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  pointsDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPoints: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
    marginLeft: 6,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayContainer: {
    width: (SCREEN_WIDTH - 60) / 4,
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.tertiary,
  },
  dayToday: {
    backgroundColor: Colors.secondary,
  },
  dayClaimed: {
    backgroundColor: Colors.primary,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },
  dayLabelClaimed: {
    color: Colors.white,
  },
  rewardCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardCircleClaimed: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  bonusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bonusText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.white,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.primary,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.primary,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default DailyCheckIn;

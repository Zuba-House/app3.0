/**
 * Verified Badge Component
 * Creative blue verified badge with checkmark
 * Similar to social media verified badges
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerifiedBadgeProps {
  size?: number;
  style?: any;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 24, 
  style 
}) => {
  // Blue gradient colors for verified badge
  const badgeBlue = '#1DA1F2'; // Twitter-like blue
  const badgeBlueLight = '#4DB4F5'; // Lighter blue for gradient effect
  const badgeBlueDark = '#0D8BD9'; // Darker blue for depth

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Outer glow/shadow layer */}
      <View 
        style={[
          styles.outerGlow,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: badgeBlueLight + '20', // 20% opacity
          }
        ]} 
      />
      
      {/* Main badge background with gradient effect */}
      <View 
        style={[
          styles.badgeBackground,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: badgeBlue,
          }
        ]}
      >
        {/* Inner highlight for 3D effect */}
        <View 
          style={[
            styles.innerHighlight,
            { 
              width: size * 0.7, 
              height: size * 0.7, 
              borderRadius: (size * 0.7) / 2,
            }
          ]} 
        />
        
        {/* Checkmark icon */}
        <View style={styles.checkmarkContainer}>
          <Ionicons 
            name="checkmark" 
            size={size * 0.5} 
            color="#FFFFFF" 
            style={styles.checkmark}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  badgeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1DA1F2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  innerHighlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    opacity: 0.6,
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkmark: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default VerifiedBadge;

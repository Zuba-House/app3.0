/**
 * Splash Screen Component
 * Beautiful animated splash screen with Zuba logo
 * Creative sun-themed animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

// Loading dots component with staggered animation
const LoadingDots: React.FC<{ opacity: Animated.Value }> = ({ opacity }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createDotAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dot1, 0).start();
    createDotAnimation(dot2, 200).start();
    createDotAnimation(dot3, 400).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.loadingContainer,
        { opacity },
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          styles.dotMargin,
          {
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          styles.dotMargin,
          {
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
};

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  duration = 2500 
}) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const raysRotation = useRef(new Animated.Value(0)).current;
  const raysOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations
    const animations = Animated.parallel([
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      
      // Logo animations - Sun rising effect
      Animated.parallel([
        // Scale up with bounce
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        // Fade in
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // Continuous rotation (sun effect)
      Animated.loop(
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      
      // Pulsing effect (breathing sun)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
      
      // Particles fade in
      Animated.timing(particlesOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
      
      // Sun rays rotation
      Animated.loop(
        Animated.timing(raysRotation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      
      // Rays fade in
      Animated.timing(raysOpacity, {
        toValue: 0.6,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      
      // Text animations
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 5,
          tension: 50,
          delay: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animations.start();

    // Auto finish after duration
    const timer = setTimeout(() => {
      // Fade out animation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(raysOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // Rotation interpolation
  const logoRotate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const raysRotate = raysRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: backgroundOpacity }
      ]}
    >
      {/* Animated background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Sun rays effect - rotating */}
      <Animated.View
        style={[
          styles.raysContainer,
          {
            transform: [{ rotate: raysRotate }],
            opacity: raysOpacity,
          },
        ]}
      >
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.ray,
              {
                transform: [{ rotate: `${i * 30}deg` }],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Floating particles effect */}
      <Animated.View
        style={[
          styles.particlesContainer,
          { opacity: particlesOpacity },
        ]}
      >
        {[...Array(20)].map((_, i) => {
          const angle = (i * 18) * (Math.PI / 180);
          const radius = 80 + (i % 3) * 20;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Main logo - rotating sun with pulse */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: Animated.multiply(logoScale, pulseScale) },
              { rotate: logoRotate },
            ],
            opacity: logoOpacity,
          },
        ]}
      >
        <Image
          source={require('../../assets/splashicon.png')}
          style={styles.logo}
          contentFit="contain"
          transition={200}
        />
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: logoOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      </Animated.View>

      {/* App name with animation */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        <Text style={styles.appName}>Zuba House</Text>
        <Text style={styles.tagline}>Shop the best deals</Text>
      </Animated.View>

      <LoadingDots opacity={textOpacity} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    backgroundColor: Colors.tertiary,
    borderRadius: width,
    opacity: 0.3,
  },
  raysContainer: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: width * 0.35,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
    opacity: 0.5,
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.secondary,
    opacity: 0.3,
    zIndex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    fontWeight: '500',
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  dotMargin: {
    marginLeft: 8,
  },
});

export default SplashScreen;

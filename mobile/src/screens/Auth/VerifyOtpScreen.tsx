/**
 * Verify OTP Screen
 * Verify OTP for password reset
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import Colors from '../../constants/colors';

const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email, isEmailVerification } = route.params || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEmailVerification) {
        const response = await authService.verifyEmail(email, otp);
        if (response && (response as any).success !== false) {
          setVerified(true);
          setTimeout(() => {
            navigation.replace('Login');
          }, 1500);
        } else {
          setError((response as any)?.message || 'Invalid OTP');
        }
      } else {
        const response = await authService.verifyForgotPasswordOtp(email, otp);
        if (response.success) {
          setVerified(true);
          setTimeout(() => {
            navigation.navigate('ResetPassword', { email });
          }, 1500);
        } else {
          setError(response.message || 'Invalid OTP');
        }
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            {isEmailVerification
              ? `Enter the verification code sent to ${email || 'your email'}`
              : `Enter the OTP sent to ${email || 'your email'}`}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {verified && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>OTP verified successfully!</Text>
            </View>
          )}

          <TextInput
            label="OTP"
            value={otp}
            onChangeText={setOtp}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
            disabled={loading || verified}
            placeholder="Enter 6-digit OTP"
          />

          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            loading={loading}
            disabled={loading || verified}
            style={styles.button}
            buttonColor={Colors.primary}
            textColor={Colors.white}
          >
            Verify OTP
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
            textColor={Colors.primary}
          >
            Back
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: Colors.primary,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: Colors.tertiary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  errorText: {
    color: Colors.primary,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: Colors.tertiary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  successText: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default VerifyOtpScreen;

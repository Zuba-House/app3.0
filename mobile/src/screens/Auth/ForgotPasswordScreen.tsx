/**
 * Forgot Password Screen
 * Request OTP for password reset
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
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import Colors from '../../constants/colors';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        // Navigate to OTP verification screen
        setTimeout(() => {
          navigation.navigate('VerifyOtp', { email });
        }, 1500);
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
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
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you an OTP to reset your password.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                OTP sent successfully! Please check your email.
              </Text>
            </View>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading || success}
          />

          <Button
            mode="contained"
            onPress={handleRequestOtp}
            loading={loading}
            disabled={loading || success}
            style={styles.button}
            buttonColor={Colors.primary}
            textColor={Colors.white}
          >
            Send OTP
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
            textColor={Colors.primary}
          >
            Back to Login
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

export default ForgotPasswordScreen;

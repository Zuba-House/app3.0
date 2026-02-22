/**
 * Login Screen
 * User authentication screen
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
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import { LoginCredentials } from '../../types/user.types';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../../constants/colors';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credentials: LoginCredentials = { email, password };
      const response = await authService.login(credentials);

      console.log('🔐 Login response received:', JSON.stringify(response, null, 2));

      // Check if we have access token (user might be empty initially)
      if (response && response.accessToken) {
        // If user is empty, try to fetch it
        if (!response.user || Object.keys(response.user).length === 0) {
          try {
            const userResponse = await authService.getCurrentUser();
            if (userResponse) {
              dispatch(
                setCredentials({
                  user: userResponse,
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken || '',
                })
              );
            } else {
              dispatch(
                setCredentials({
                  user: {} as any, // Will be fetched later
                  accessToken: response.accessToken,
                  refreshToken: response.refreshToken || '',
                })
              );
            }
          } catch (userError) {
            console.error('Error fetching user:', userError);
            // Still set credentials with token, user can be fetched later
            dispatch(
              setCredentials({
                user: {} as any,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken || '',
              })
            );
          }
        } else {
          dispatch(
            setCredentials({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || '',
            })
          );
        }
        // Navigation will be handled by AppNavigator automatically
      } else {
        throw new Error('Invalid response from server - no access token');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Don't show "Login successfully" as an error
      const errorMessage = err.message;
      if (errorMessage && !errorMessage.toLowerCase().includes('successfully')) {
        setError(errorMessage || 'Login failed. Please try again.');
      } else {
        // If error message says "successfully", it's actually a success
        // This shouldn't happen, but handle it gracefully
        console.log('Login appears successful despite error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // For now, show a helpful message
      // Google OAuth requires backend configuration to exchange the auth code
      // The backend endpoint exists, but needs Google OAuth credentials configured
      setError('Google login requires OAuth credentials setup. Please use email/password for now. Contact support to enable Google login.');
      
      // TODO: Once Google OAuth is configured on backend:
      // 1. Get Google user info from OAuth flow
      // 2. Call authService.loginWithGoogle() with user info
      // 3. Handle success/error
      
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed. Please use email/password.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
            disabled={loading}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={Colors.primary}
            textColor={Colors.white}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
            textColor={Colors.primary}
          >
            Don't have an account? Sign up
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotButton}
            textColor={Colors.primary}
          >
            Forgot Password?
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading || googleLoading}
            style={styles.googleButton}
            buttonColor={Colors.white}
            textColor={Colors.primary}
            borderColor={Colors.secondary}
          >
            Continue with Google
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
  forgotButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.primary,
    opacity: 0.7,
    fontSize: 14,
  },
  googleButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderColor: Colors.secondary,
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
});

export default LoginScreen;


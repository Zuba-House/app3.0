import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useLogin } from './hooks/useLogin';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import GoogleAuthButton from './components/GoogleAuthButton';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { submit, submitting, error } = useLogin();
  const { signInWithGoogle, googleLoading, googleError, googleReady, googleConfigIssues } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const primaryError = error || googleError;

  const onSubmit = async () => {
    const ok = await submit({ email, password });
    if (ok && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const onGoogle = async () => {
    const ok = await signInWithGoogle();
    if (ok && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Continue shopping with your saved cart, orders, and wishlist sync.</Text>
            {primaryError ? <Text style={styles.error}>{primaryError}</Text> : null}
            {googleConfigIssues.length > 0 ? <Text style={styles.info}>Google Sign-In is currently unavailable in this runtime. You can continue with email.</Text> : null}
            <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput
              label="Password"
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((prev) => !prev)} />}
            />
            <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink} labelStyle={styles.forgotLinkLabel}>
              Forgot password?
            </Button>
            <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={googleLoading} style={styles.primaryBtn} contentStyle={styles.primaryBtnContent} labelStyle={styles.primaryBtnLabel}>
              Continue
            </Button>
            <GoogleAuthButton onPress={onGoogle} loading={googleLoading} disabled={!googleReady || submitting} />
            <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.link} labelStyle={styles.linkLabel}>
              Create account
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  keyboard: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: Colors.background, padding: 20, justifyContent: 'center', alignItems: 'center' },
  formCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F7F6F3',
    borderRadius: 22,
    padding: 20,
    gap: 12,
  },
  title: { fontSize: 34, fontWeight: '800', color: Colors.primary, marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5A66', marginBottom: 10, textAlign: 'center' },
  input: { marginBottom: 4 },
  error: { color: '#d32f2f' },
  info: { color: '#a16207', fontSize: 13 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -8 },
  forgotLinkLabel: { color: '#1f4a66', fontWeight: '600' },
  primaryBtn: { marginTop: 2, borderRadius: 14 },
  primaryBtnContent: { minHeight: 52 },
  primaryBtnLabel: { color: '#FFFFFF', fontWeight: '700' },
  link: { marginTop: 8, alignSelf: 'center' },
  linkLabel: { color: Colors.primary, fontWeight: '600' },
});

export default LoginScreen;

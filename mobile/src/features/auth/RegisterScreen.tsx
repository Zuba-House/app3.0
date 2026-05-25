import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Text, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useRegister } from './hooks/useRegister';
import GoogleSignInSection, { isGoogleSignInConfigured } from './components/GoogleSignInSection';

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { submit, submitting, error } = useRegister();
  const onAuthSuccess = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };
  const googleConfigured = isGoogleSignInConfigured();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const primaryError = error;
  const isBusy = submitting;

  const onSubmit = async () => {
    const ok = await submit({ name, email, password });
    if (ok) {
      navigation.navigate('VerifyOtp', {
        email: email.trim().toLowerCase(),
        purpose: 'verifyEmail',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <Text style={styles.title}>{t('auth.signUp')}</Text>
            <Text style={styles.subtitle}>{t('auth.signUpSubtitle')}</Text>
            {primaryError ? <Text style={styles.error}>{primaryError}</Text> : null}
            <TextInput label={t('auth.name')} mode="outlined" value={name} onChangeText={setName} />
            <TextInput label={t('auth.email')} mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput
              label={t('auth.password')}
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((prev) => !prev)} />}
            />
            <Button
              mode="contained"
              onPress={onSubmit}
              loading={submitting}
              disabled={isBusy}
              style={styles.primaryBtn}
              contentStyle={styles.primaryBtnContent}
              labelStyle={styles.primaryBtnLabel}
            >
              {t('common.continue')}
            </Button>
            <Text style={styles.orDivider}>{t('auth.orContinueWith')}</Text>
            {googleConfigured ? (
              <GoogleSignInSection onSuccess={onAuthSuccess} disabled={isBusy} />
            ) : (
              <Text style={styles.googleHint}>
                Google sign-up will appear after you install the latest app update from TestFlight.
              </Text>
            )}
            <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link} labelStyle={styles.linkLabel}>
              {t('auth.alreadyHaveAccount')}
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
  primaryBtn: { marginTop: 2, borderRadius: 14 },
  primaryBtnContent: { minHeight: 52 },
  primaryBtnLabel: { color: '#FFFFFF', fontWeight: '700' },
  orDivider: { textAlign: 'center', color: '#6B7C89', fontSize: 13, marginVertical: 4 },
  link: { marginTop: 8, alignSelf: 'center' },
  linkLabel: { color: Colors.primary, fontWeight: '600' },
  googleHint: { textAlign: 'center', color: '#6B7C89', fontSize: 13, lineHeight: 18 },
});

export default RegisterScreen;

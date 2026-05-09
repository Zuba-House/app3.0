import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useVerifyOtp } from './hooks/useVerifyOtp';

const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { verifyEmail, verifyForgotPassword, error, submitting } = useVerifyOtp();
  const [otp, setOtp] = useState('');

  const email = String(route.params?.email || '').trim().toLowerCase();
  const purpose = route.params?.purpose === 'forgotPassword' ? 'forgotPassword' : 'verifyEmail';
  const title = purpose === 'forgotPassword' ? 'Confirm reset code' : 'Verify your email';

  const onSubmit = async () => {
    if (!email) {
      return;
    }
    const payload = { email, otp: otp.trim() };
    const ok =
      purpose === 'forgotPassword'
        ? await verifyForgotPassword(payload)
        : await verifyEmail(payload);
    if (!ok) return;
    if (purpose === 'forgotPassword') {
      navigation.navigate('ResetPassword', { email, otp: otp.trim() });
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>We sent a 6-digit code to {email || 'your email'}.</Text>
            {!email ? <Text style={styles.error}>Missing email for verification. Please restart from login.</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              label="Verification code"
              mode="outlined"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button mode="contained" onPress={onSubmit} loading={submitting} style={styles.primaryBtn} contentStyle={styles.primaryBtnContent} labelStyle={styles.primaryBtnLabel}>
              Confirm code
            </Button>
            <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link} labelStyle={styles.linkLabel}>
              Back to sign in
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
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: Colors.background, alignItems: 'center' },
  formCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F7F6F3',
    borderRadius: 22,
    padding: 20,
    gap: 12,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary, textAlign: 'center' },
  text: { color: '#4A5A66', fontSize: 14, textAlign: 'center' },
  error: { color: '#d32f2f' },
  primaryBtn: { borderRadius: 14 },
  primaryBtnContent: { minHeight: 52 },
  primaryBtnLabel: { color: '#FFFFFF', fontWeight: '700' },
  link: { marginTop: 6, alignSelf: 'center' },
  linkLabel: { color: Colors.primary, fontWeight: '600' },
});

export default VerifyOtpScreen;

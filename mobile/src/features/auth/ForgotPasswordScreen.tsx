import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useForgotPassword } from './hooks/useForgotPassword';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { submit, submitting, error } = useForgotPassword();
  const [email, setEmail] = useState('');

  const onSubmit = async () => {
    const ok = await submit(email);
    if (ok) {
      navigation.navigate('VerifyOtp', {
        email: email.trim().toLowerCase(),
        purpose: 'forgotPassword',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.text}>Enter your email and we will send a reset code.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <Button mode="contained" onPress={onSubmit} loading={submitting} style={styles.primaryBtn} contentStyle={styles.primaryBtnContent} labelStyle={styles.primaryBtnLabel}>
              Send reset code
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
  input: { marginTop: 6 },
  primaryBtn: { borderRadius: 14 },
  primaryBtnContent: { minHeight: 52 },
  primaryBtnLabel: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#d32f2f' },
  link: { marginTop: 6, alignSelf: 'center' },
  linkLabel: { color: Colors.primary, fontWeight: '600' },
});

export default ForgotPasswordScreen;

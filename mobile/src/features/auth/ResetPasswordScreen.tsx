import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useResetPassword } from './hooks/useResetPassword';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { submit, error, submitting } = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const email = String(route.params?.email || '').trim().toLowerCase();
  const otp = String(route.params?.otp || '').trim();

  const onSubmit = async () => {
    if (!email || !otp) return;
    const ok = await submit({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    if (!ok) return;
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.title}>Set new password</Text>
            <Text style={styles.text}>Create a new password for {email || 'your account'}.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              label="New password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword((prev) => !prev)} />}
            />
            <TextInput
              label="Confirm password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Button mode="contained" onPress={onSubmit} loading={submitting} style={styles.primaryBtn} contentStyle={styles.primaryBtnContent} labelStyle={styles.primaryBtnLabel}>
              Reset password
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

export default ResetPasswordScreen;

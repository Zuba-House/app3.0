import React, { useState } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Text, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { useRegister } from './hooks/useRegister';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import GoogleAuthButton from './components/GoogleAuthButton';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { submit, submitting, error } = useRegister();
  const { signInWithGoogle, googleLoading, googleError, googleReady, googleConfigIssues } = useGoogleAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    const ok = await submit({ name, email, password });
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up in seconds and keep your shopping session in sync.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {googleError ? <Text style={styles.error}>{googleError}</Text> : null}
          {googleConfigIssues.length > 0 ? <Text style={styles.info}>Google OAuth setup is incomplete. Email signup still works.</Text> : null}
          <TextInput label="Name" mode="outlined" value={name} onChangeText={setName} />
          <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput label="Password" mode="outlined" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={googleLoading} style={styles.primaryBtn} contentStyle={styles.primaryBtnContent}>
            Continue
          </Button>
          <GoogleAuthButton onPress={onGoogle} loading={googleLoading} disabled={!googleReady || submitting} />
          <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link}>
            Already have an account
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  keyboard: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: Colors.background, padding: 24, justifyContent: 'center', gap: 12 },
  title: { fontSize: 34, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5A66', marginBottom: 10 },
  input: { marginBottom: 4 },
  error: { color: '#d32f2f' },
  info: { color: '#a16207', fontSize: 13 },
  primaryBtn: { marginTop: 2, borderRadius: 14 },
  primaryBtnContent: { minHeight: 52 },
  link: { marginTop: 8 },
});

export default RegisterScreen;

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthState } from '../../core/auth/authGuards';
import { SettingsSubScreen } from '../../components/settings/SettingsSubScreen';
import { useAppTheme } from '../../context/ThemeContext';
import { userService } from '../../services/user.service';
import { showError, showSuccess } from '../../utils/toast';

function passwordStrength(pw: string): { label: string; pct: number; color: string } {
  if (!pw) return { label: '', pct: 0, color: '#d1d5db' };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (score <= 2) return { label: 'Weak', pct: 0.33, color: '#dc2626' };
  if (score <= 3) return { label: 'Fair', pct: 0.66, color: '#f59e0b' };
  return { label: 'Strong', pct: 1, color: '#16a34a' };
}

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthState();
  const { colors } = useAppTheme();
  const isGoogle = Boolean(user?.signUpWithGoogle);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const strength = useMemo(() => passwordStrength(next), [next]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current.trim()) e.current = 'Current password is required';
    if (!next || next.length < 8) e.next = 'New password must be at least 8 characters';
    if (next !== confirm) e.confirm = 'Passwords must match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !user?.email) return;
    setSaving(true);
    const result = await userService.changePassword({
      email: user.email,
      currentPassword: current,
      newPassword: next,
      confirmPassword: confirm,
    });
    setSaving(false);
    if (result.success) {
      showSuccess('Password updated');
      navigation.goBack();
    } else {
      showError(result.message || 'Could not update password');
    }
  };

  if (isGoogle) {
    return (
      <SettingsSubScreen title="Change Password">
        <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, lineHeight: 22 }}>
            Your account uses Google Sign-In. Password change is not available.
          </Text>
        </View>
      </SettingsSubScreen>
    );
  }

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    key: string,
    err?: string
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { color: colors.text, borderColor: err ? colors.danger : colors.border, backgroundColor: colors.card },
        ]}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        placeholderTextColor={colors.textMuted}
      />
      {err ? <Text style={styles.err}>{err}</Text> : null}
    </View>
  );

  return (
    <SettingsSubScreen
      title="Change Password"
      footer={
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={() => void submit()}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
          </TouchableOpacity>
        </View>
      }
    >
      {field('Current Password', current, setCurrent, 'current', errors.current)}
      {field('New Password', next, setNext, 'next', errors.next)}
      {next.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={[styles.barBg, { backgroundColor: colors.border }]}>
            <View style={[styles.barFill, { width: `${strength.pct * 100}%`, backgroundColor: strength.color }]} />
          </View>
          <Text style={{ fontSize: 12, color: strength.color, marginTop: 4 }}>{strength.label}</Text>
        </View>
      )}
      {field('Confirm New Password', confirm, setConfirm, 'confirm', errors.confirm)}
    </SettingsSubScreen>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16 },
  err: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  notice: { padding: 16, borderRadius: 12, borderWidth: 1 },
  footer: { padding: 16, paddingBottom: 28, borderTopWidth: 1 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ChangePasswordScreen;

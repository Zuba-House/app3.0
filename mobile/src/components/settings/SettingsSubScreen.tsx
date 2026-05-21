import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

type Props = {
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
};

export const SettingsSubScreen: React.FC<Props> = ({ title, children, footer, loading }) => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 40 }} />
        ) : (
          children
        )}
      </ScrollView>
      {footer}
    </View>
  );
};

export function SettingsSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </>
  );
}

export function SettingsToggleRow({
  label,
  value,
  onValueChange,
  disabled,
  last,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.rowLabel, { color: colors.text }, disabled && { opacity: 0.5 }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.secondary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function SettingsLinkRow({
  label,
  onPress,
  subtitle,
  last,
}: {
  label: string;
  onPress: () => void;
  subtitle?: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});

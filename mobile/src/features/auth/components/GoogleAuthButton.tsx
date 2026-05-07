import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../../../constants/colors';

interface Props {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

const GoogleAuthButton: React.FC<Props> = ({ onPress, loading, disabled }) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={({ pressed }) => [styles.button, pressed && !isDisabled ? styles.pressed : null, isDisabled ? styles.disabled : null]}
    >
      <View style={styles.iconWrap}>
        <FontAwesome name="google" size={18} color="#DB4437" />
      </View>
      <Text style={styles.label}>Continue with Google</Text>
      {loading ? <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} /> : <View style={styles.spinnerPlaceholder} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
  iconWrap: { width: 22, alignItems: 'center' },
  label: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#202124' },
  spinner: { marginLeft: 8 },
  spinnerPlaceholder: { width: 18, marginLeft: 8 },
});

export default GoogleAuthButton;

import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
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
        <View style={styles.gMark}>
          <View style={[styles.quad, styles.tl]} />
          <View style={[styles.quad, styles.tr]} />
          <View style={[styles.quad, styles.bl]} />
          <View style={[styles.quad, styles.br]} />
          <View style={styles.innerHole} />
          <View style={styles.crossBar} />
        </View>
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
  gMark: { width: 18, height: 18, position: 'relative' },
  quad: { position: 'absolute', width: 9, height: 9 },
  tl: { left: 0, top: 0, backgroundColor: '#4285F4', borderTopLeftRadius: 9 },
  tr: { right: 0, top: 0, backgroundColor: '#DB4437', borderTopRightRadius: 9 },
  bl: { left: 0, bottom: 0, backgroundColor: '#0F9D58', borderBottomLeftRadius: 9 },
  br: { right: 0, bottom: 0, backgroundColor: '#F4B400', borderBottomRightRadius: 9 },
  innerHole: { position: 'absolute', left: 4, top: 4, width: 10, height: 10, borderRadius: 6, backgroundColor: '#FFFFFF' },
  crossBar: { position: 'absolute', right: 0, top: 8, width: 7, height: 2.4, backgroundColor: '#4285F4', borderRadius: 2 },
  label: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#202124' },
  spinner: { marginLeft: 8 },
  spinnerPlaceholder: { width: 18, marginLeft: 8 },
});

export default GoogleAuthButton;

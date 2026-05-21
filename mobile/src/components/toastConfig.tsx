import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BaseToastProps } from 'react-native-toast-message';

const TOAST_BG = '#1a2332';
const TOAST_ACCENT = '#e8a87c';

function ToastCard({ text1, text2, accent }: BaseToastProps & { accent?: string }) {
  return (
    <View style={[styles.card, accent ? { borderLeftColor: accent } : null]}>
      {text1 ? <Text style={styles.title}>{text1}</Text> : null}
      {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
    </View>
  );
}

export const toastConfig = {
  success: (props: BaseToastProps) => <ToastCard {...props} accent={TOAST_ACCENT} />,
  error: (props: BaseToastProps) => <ToastCard {...props} accent="#e57373" />,
  info: (props: BaseToastProps) => <ToastCard {...props} accent="#90caf9" />,
  warning: (props: BaseToastProps) => <ToastCard {...props} accent="#ffb74d" />,
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    backgroundColor: TOAST_BG,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: TOAST_ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#c5d0dc',
    fontSize: 13,
    marginTop: 4,
  },
});

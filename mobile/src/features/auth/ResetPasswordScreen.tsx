import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

const ResetPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set new password</Text>
      <Text style={styles.text}>Reset password endpoint wiring is part of the new auth rollout.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: '700', color: Colors.primary, marginBottom: 10 },
  text: { color: Colors.primary, opacity: 0.8, textAlign: 'center' },
});

export default ResetPasswordScreen;

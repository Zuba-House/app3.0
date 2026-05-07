import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.text}>This flow will be implemented in the new auth module.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: '700', color: Colors.primary, marginBottom: 10 },
  text: { color: Colors.primary, opacity: 0.8, textAlign: 'center' },
});

export default ForgotPasswordScreen;

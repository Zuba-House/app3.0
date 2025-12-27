/**
 * Profile Screen
 * User profile screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

const ProfileScreen: React.FC = () => {
  const user = useAppSelector(selectUser);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Text style={styles.subtitle}>Profile screen coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;


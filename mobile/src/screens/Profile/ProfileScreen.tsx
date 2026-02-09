/**
 * Profile Screen
 * User profile screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import Colors from '../../constants/colors';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout()); // Logout locally even if API fails
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Please Login</Text>
        <Text style={styles.emptySubtitle}>
          Login to view your profile and manage your account
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          style={styles.button}
        >
          Login
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          style={styles.button}
        >
          Sign Up
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={Colors.primary}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
  },
  userInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.primary,
  },
  email: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primary,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.primary,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 12,
    width: '80%',
  },
  logoutButton: {
    marginTop: 32,
    width: '80%',
  },
});

export default ProfileScreen;


import {
  createNavigationContainerRef,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { MainStackParamList } from './AppNavigator';

export type RootStackParamList = {
  MainApp: NavigatorScreenParams<MainStackParamList> | undefined;
  AuthModal: { screen?: 'Login' | 'Register' } | undefined;
};

export const rootNavigationRef =
  createNavigationContainerRef<RootStackParamList>();

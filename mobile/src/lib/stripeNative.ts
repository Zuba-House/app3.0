import { TurboModuleRegistry } from 'react-native';

/** True when the current binary includes @stripe/stripe-react-native (dev/production build, not Expo Go). */
export function isStripeNativeModuleAvailable(): boolean {
  try {
    return TurboModuleRegistry.get('StripeSdk') != null;
  } catch {
    return false;
  }
}

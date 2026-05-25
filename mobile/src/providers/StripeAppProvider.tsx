import React from 'react';
import { isStripePublishableKeyConfigured } from '../constants/config';
import { isStripeNativeModuleAvailable } from '../lib/stripeNative';

type Props = {
  publishableKey: string;
  children: React.ReactNode;
};

/**
 * Wraps the app with StripeProvider only when the native Stripe module is linked.
 * Avoids importing @stripe/stripe-react-native at startup when the module is missing
 * (Expo Go or an outdated dev client).
 */
export function StripeAppProvider({ publishableKey, children }: Props) {
  if (!isStripePublishableKeyConfigured(publishableKey) || !isStripeNativeModuleAvailable()) {
    return <>{children}</>;
  }

  const { StripeProvider } = require('@stripe/stripe-react-native') as typeof import('@stripe/stripe-react-native');

  return (
    <StripeProvider publishableKey={publishableKey}>
      <>{children}</>
    </StripeProvider>
  );
}

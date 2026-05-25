import React from 'react';
import { Text } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';
import { resolveGoogleClientIds, useGoogleSignIn } from '../hooks/useGoogleSignIn';

interface GoogleSignInSectionProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export function isGoogleSignInConfigured(): boolean {
  const clientIds = resolveGoogleClientIds();
  return Boolean(clientIds.webClientId || clientIds.iosClientId || clientIds.androidClientId);
}

/**
 * Isolated Google OAuth — only mounts the auth hook when client IDs exist,
 * preventing useAuthRequest from crashing the app in production builds.
 */
const GoogleSignInSection: React.FC<GoogleSignInSectionProps> = ({ onSuccess, disabled }) => {
  const { signInWithGoogle, error, submitting, disabled: googleDisabled } = useGoogleSignIn(onSuccess);

  return (
    <>
      {error ? <Text style={{ color: '#d32f2f', marginBottom: 8 }}>{error}</Text> : null}
      <GoogleSignInButton
        onPress={() => void signInWithGoogle()}
        loading={submitting}
        disabled={googleDisabled || disabled || submitting}
      />
    </>
  );
};

export default GoogleSignInSection;

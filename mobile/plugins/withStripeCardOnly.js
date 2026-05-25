/**
 * Stripe native module without Apple Pay / Google Pay entitlements.
 * Use when you only need in-app card Payment Sheet (no wallet capabilities).
 */
const {
  createRunOncePlugin,
  withAndroidManifest,
} = require('@expo/config-plugins');
const {
  withNoopSwiftFile,
  setGooglePayMetaData,
} = require('@stripe/stripe-react-native/lib/commonjs/plugin/withStripe');

const withStripeCardOnly = (config) => {
  config = withNoopSwiftFile(config);
  config = withAndroidManifest(config, (mod) => {
    mod.modResults = setGooglePayMetaData(false, mod.modResults);
    return mod;
  });
  return config;
};

module.exports = createRunOncePlugin(withStripeCardOnly, 'with-stripe-card-only', '1.0.0');

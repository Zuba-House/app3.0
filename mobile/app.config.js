// Dynamic Expo config — injects iOS Google OAuth URL scheme from mobile/.env

require('dotenv').config();



const appJson = require('./app.json');



function getIosGoogleUrlScheme() {

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

  if (!iosClientId?.endsWith('.apps.googleusercontent.com')) {

    return null;

  }

  const clientIdPart = iosClientId.slice(0, -'.apps.googleusercontent.com'.length);

  return `com.googleusercontent.apps.${clientIdPart}`;

}



module.exports = () => {
  const buildProfile = process.env.EAS_BUILD_PROFILE || '';
  const isStoreRelease = buildProfile === 'production' || buildProfile === 'preview';

  const appScheme = appJson.expo.scheme || 'zuba';

  const googleScheme = getIosGoogleUrlScheme();

  const plugins = (appJson.expo.plugins || []).filter((plugin) => {
    if (!isStoreRelease) return true;
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== 'expo-dev-client';
  });



  const cfBundleURLTypes = [{ CFBundleURLSchemes: [appScheme] }];

  if (googleScheme && googleScheme !== appScheme) {

    cfBundleURLTypes.push({ CFBundleURLSchemes: [googleScheme] });

  }



  const baseInfoPlist = appJson.expo.ios?.infoPlist || {};



  return {

    expo: {

      ...appJson.expo,

      ios: {

        ...appJson.expo.ios,

        config: {

          ...(appJson.expo.ios?.config || {}),

          usesNonExemptEncryption: false,

        },

        infoPlist: {

          ...baseInfoPlist,

          CFBundleDisplayName: 'Zuba House',

          CFBundleURLTypes: cfBundleURLTypes,

          ITSAppUsesNonExemptEncryption: false,

          NSCameraUsageDescription: 'Used to upload profile photo and search products by image',

          NSPhotoLibraryUsageDescription: 'Used to select profile photo and search products by image',

        },

      },

      android: {

        ...appJson.expo.android,

        permissions: [

          'android.permission.INTERNET',

          'android.permission.CAMERA',

          'android.permission.READ_MEDIA_IMAGES',

          'android.permission.ACCESS_COARSE_LOCATION',

          'android.permission.ACCESS_FINE_LOCATION',

          'android.permission.POST_NOTIFICATIONS',

        ],

      },

      plugins,

      extra: {

        ...appJson.expo.extra,

        eas: {

          ...(appJson.expo.extra?.eas || {}),

          projectId: 'b1c36a7f-6753-42dd-a363-8c673e354a69',

        },

        googleIosUrlScheme: googleScheme || undefined,
        googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || undefined,
        googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined,
        googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || undefined,

        stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,

        apiUrl: process.env.EXPO_PUBLIC_API_URL?.trim() || appJson.expo.extra?.apiUrl,

      },

    },

  };

};


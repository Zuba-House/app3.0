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

  const appScheme = appJson.expo.scheme || 'zuba';

  const googleScheme = getIosGoogleUrlScheme();



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

      plugins: [
        '@stripe/stripe-react-native',
        ...(appJson.expo.plugins || []).filter(
          (p) => p !== '@stripe/stripe-react-native'
        ),
      ],

      extra: {

        ...appJson.expo.extra,

        eas: {

          ...(appJson.expo.extra?.eas || {}),

          projectId: 'b1c36a7f-6753-42dd-a363-8c673e354a69',

        },

        googleIosUrlScheme: googleScheme || undefined,

      },

    },

  };

};


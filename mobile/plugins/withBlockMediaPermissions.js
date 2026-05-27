const { AndroidConfig } = require('expo/config-plugins');

const MEDIA_PERMISSIONS = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_EXTERNAL_STORAGE',
];

/** Block broad gallery permissions; Android uses the system photo picker instead. */
function withBlockMediaPermissions(config) {
  return AndroidConfig.Permissions.withBlockedPermissions(config, MEDIA_PERMISSIONS);
}

module.exports = withBlockMediaPermissions;

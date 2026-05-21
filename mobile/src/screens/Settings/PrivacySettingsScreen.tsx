import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  SettingsSubScreen,
  SettingsSection,
  SettingsToggleRow,
  SettingsLinkRow,
} from '../../components/settings/SettingsSubScreen';
import {
  loadPrivacySettings,
  savePrivacySettings,
  PrivacySettings,
} from '../../utils/settingsStorage';
const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [prefs, setPrefs] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    loadPrivacySettings().then(setPrefs);
  }, []);

  const update = async (key: keyof PrivacySettings, value: boolean) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await savePrivacySettings(next);
  };

  if (!prefs) return <SettingsSubScreen title="Privacy Settings" loading />;

  return (
    <SettingsSubScreen title="Privacy Settings">
      <SettingsSection label="Data & personalization">
        <SettingsToggleRow
          label="Personalized recommendations"
          value={prefs.personalizedRecommendations}
          onValueChange={(v) => void update('personalizedRecommendations', v)}
        />
        <SettingsToggleRow
          label="Recently viewed tracking"
          value={prefs.recentlyViewedTracking}
          onValueChange={(v) => void update('recentlyViewedTracking', v)}
        />
        <SettingsToggleRow
          label="Analytics & usage data"
          value={prefs.analyticsUsage}
          onValueChange={(v) => void update('analyticsUsage', v)}
          last
        />
      </SettingsSection>

      <SettingsSection label="Account visibility">
        <SettingsToggleRow
          label="Show my profile to vendors"
          value={prefs.showProfileToVendors}
          onValueChange={(v) => void update('showProfileToVendors', v)}
        />
        <SettingsToggleRow
          label="Email me about order updates"
          value={prefs.emailOrderUpdates}
          onValueChange={(v) => void update('emailOrderUpdates', v)}
          last
        />
      </SettingsSection>

      <SettingsSection label="Data requests">
        <SettingsLinkRow
          label="Download my data"
          onPress={() =>
            Alert.alert(
              'Data export',
              'Data export is not yet available. Contact support@zubahouse.com'
            )
          }
        />
        <SettingsLinkRow
          label="Delete my data"
          onPress={() => navigation.navigate('Settings')}
          last
        />
      </SettingsSection>
    </SettingsSubScreen>
  );
};

export default PrivacySettingsScreen;

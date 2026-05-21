import React, { useEffect, useState } from 'react';
import { SettingsSubScreen, SettingsSection, SettingsToggleRow } from '../../components/settings/SettingsSubScreen';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
} from '../../utils/settingsStorage';
import { refreshNotificationPrefsCache } from '../../utils/notificationPrefs';

const NotificationPreferencesScreen: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    loadNotificationPreferences().then(setPrefs);
  }, []);

  const update = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await saveNotificationPreferences(next);
    await refreshNotificationPrefsCache();
  };

  if (!prefs) return <SettingsSubScreen title="Notification Preferences" loading />;

  return (
    <SettingsSubScreen title="Notification Preferences">
      <SettingsSection label="Order updates">
        <SettingsToggleRow label="Order confirmed" value={prefs.orderConfirmed} onValueChange={(v) => void update('orderConfirmed', v)} />
        <SettingsToggleRow label="Order shipped" value={prefs.orderShipped} onValueChange={(v) => void update('orderShipped', v)} />
        <SettingsToggleRow label="Order delivered" value={prefs.orderDelivered} onValueChange={(v) => void update('orderDelivered', v)} />
        <SettingsToggleRow label="Order cancelled" value={prefs.orderCancelled} onValueChange={(v) => void update('orderCancelled', v)} last />
      </SettingsSection>

      <SettingsSection label="Promotions">
        <SettingsToggleRow label="Flash sales & deals" value={prefs.flashSales} onValueChange={(v) => void update('flashSales', v)} />
        <SettingsToggleRow label="App-exclusive offers" value={prefs.appOffers} onValueChange={(v) => void update('appOffers', v)} />
        <SettingsToggleRow label="New arrivals" value={prefs.newArrivals} onValueChange={(v) => void update('newArrivals', v)} last />
      </SettingsSection>

      <SettingsSection label="Account">
        <SettingsToggleRow
          label="Security alerts"
          value={prefs.securityAlerts}
          onValueChange={(v) => void update('securityAlerts', v)}
          disabled
        />
        <SettingsToggleRow
          label="Account activity"
          value={prefs.accountActivity}
          onValueChange={(v) => void update('accountActivity', v)}
          last
        />
      </SettingsSection>
    </SettingsSubScreen>
  );
};

export default NotificationPreferencesScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { APP_VERSION, SOCIAL_LINKS } from '../../constants/config';
import { SettingsSubScreen, SettingsSection, SettingsLinkRow } from '../../components/settings/SettingsSubScreen';
import { useAppTheme } from '../../context/ThemeContext';

const AboutScreen: React.FC = () => {
  const { colors } = useAppTheme();

  const open = (url: string) => {
    if (url) void WebBrowser.openBrowserAsync(url);
  };

  return (
    <SettingsSubScreen title="About Zuba House">
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <View style={[styles.logo, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.logoText, { color: colors.primary }]}>ZH</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>Zuba House</Text>
        <Text style={{ color: colors.textMuted }}>v{APP_VERSION}</Text>
        <Text style={[styles.tagline, { color: colors.text }]}>Your African fashion marketplace</Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>
          Zuba House connects you with authentic African fashion, accessories, and lifestyle products.
          Shop curated brands with secure checkout and reliable delivery across North America.
        </Text>
      </View>

      <SettingsSection label="Follow us">
        <SettingsLinkRow
          label="Instagram — @zuba_house"
          onPress={() => open(SOCIAL_LINKS.instagram)}
        />
        <SettingsLinkRow label="X (Twitter) — @zubainfo" onPress={() => open(SOCIAL_LINKS.twitter)} />
        <SettingsLinkRow
          label="Facebook — Zuba House"
          onPress={() => open(SOCIAL_LINKS.facebook)}
        />
        <SettingsLinkRow
          label="TikTok — @zubahouse"
          onPress={() => open(SOCIAL_LINKS.tiktok)}
          last
        />
      </SettingsSection>

      <SettingsSection label="Contact">
        <SettingsLinkRow
          label="support@zubahouse.com"
          onPress={() => Linking.openURL(SOCIAL_LINKS.email)}
        />
        <SettingsLinkRow label="zubahouse.com" onPress={() => open(SOCIAL_LINKS.website)} last />
      </SettingsSection>
    </SettingsSubScreen>
  );
};

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    marginBottom: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700' },
  tagline: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: 'center' },
});

export default AboutScreen;

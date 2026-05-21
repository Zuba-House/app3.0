/**
 * Settings — preferences, legal, account deletion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAppDispatch } from '../../store/hooks';
import { clearCart } from '../../store/slices/cartSlice';
import { userService } from '../../services/user.service';
import { authManager } from '../../core/auth/authManager';
import { showError, showSuccess, showInfo } from '../../utils/toast';
import { pressNavigate } from '../../navigation/navigationHelpers';
import { lightHaptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import { LEGAL_URLS, CurrencyCode } from '../../constants/config';
import { useAppTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { changeLanguage, getDeleteConfirmWord, type AppLang } from '../../i18n';
import { PickerSheet } from '../../components/settings/PickerSheet';

type DeleteStep = 'closed' | 'warn' | 'confirm' | 'processing';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode, setDarkMode } = useAppTheme();
  const { currency, setCurrency, isAutoDetected, resetToAutoDetect } = useCurrency();

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('closed');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [langSheet, setLangSheet] = useState(false);
  const [currencySheet, setCurrencySheet] = useState(false);

  const selectedLang = (i18n.language === 'fr' ? 'fr' : 'en') as AppLang;
  const languageSubtitle = selectedLang === 'fr' ? 'Français' : 'English';
  const currencySubtitle = isAutoDetected
    ? `${currency} (${t('currency.autoDetected')})`
    : currency;
  const deleteConfirmWord = getDeleteConfirmWord();

  const openLink = async (url: string, fallback?: string) => {
    await lightHaptic();
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      if (fallback) await WebBrowser.openBrowserAsync(fallback);
    }
  };

  const onLanguageSelect = async (code: AppLang) => {
    await changeLanguage(code);
    setLangSheet(false);
    showSuccess(code === 'fr' ? 'Langue mise à jour ✓' : 'Language updated ✓');
  };

  const onCurrencySelect = async (code: CurrencyCode) => {
    await setCurrency(code);
    setCurrencySheet(false);
    showSuccess(t('common.success'), t('settings.currencySet', { code }));
  };

  const onDarkToggle = async (value: boolean) => {
    await setDarkMode(value);
    showInfo(value ? t('settings.darkModeOn') : t('settings.darkModeOff'));
  };

  const closeDeleteFlow = () => {
    Keyboard.dismiss();
    setDeleteConfirmText('');
    setDeleteStep('closed');
  };

  const runDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== deleteConfirmWord.toUpperCase()) return;
    Keyboard.dismiss();
    setDeleteStep('processing');
    try {
      const result = await userService.deleteAccount();
      if (!result.success) {
        throw new Error(result.message || 'Deletion failed');
      }
      dispatch(clearCart());
      await authManager.purgeLocalAccountData();
      closeDeleteFlow();
      showSuccess(t('deleteAccount.deleted'));
      navigation.navigate('MainTabs', { screen: 'Account' });
    } catch (e) {
      setDeleteStep('confirm');
      const msg = e instanceof Error ? e.message : 'Could not delete account';
      showError(
        msg.includes('support@')
          ? msg
          : `${msg}. Try again or contact support@zubahouse.com`
      );
    }
  };

  const sheetBottomPad = Math.max(insets.bottom, 20);

  const renderDeleteSheet = (
    visible: boolean,
    content: React.ReactNode,
    opts?: { keyboard?: boolean }
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeDeleteFlow}
    >
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.sheetOverlayInner}>
          <TouchableWithoutFeedback onPress={closeDeleteFlow}>
            <View style={styles.sheetBackdrop} />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.card, paddingBottom: sheetBottomPad },
            ]}
          >
            {opts?.keyboard ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {content}
              </ScrollView>
            ) : (
              content
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const menuRow = (
    icon: string,
    title: string,
    subtitle: string | undefined,
    onPress: () => void,
    opts?: { danger?: boolean; rightElement?: React.ReactNode }
  ) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={opts?.rightElement ? 1 : 0.7}
      disabled={Boolean(opts?.rightElement)}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.tertiary }, opts?.danger && styles.iconWrapDanger]}>
        <Ionicons name={icon as any} size={22} color={opts?.danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: opts?.danger ? colors.danger : colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSub, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {opts?.rightElement ?? (!opts?.danger && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.accountSettings')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {menuRow('person-outline', t('settings.editProfile'), undefined, () => void pressNavigate(navigation, 'EditProfile'))}
          {menuRow('lock-closed-outline', t('settings.changePassword'), undefined, () =>
            void pressNavigate(navigation, 'ChangePassword')
          )}
          {menuRow('notifications-outline', t('settings.notificationPrefs'), undefined, () =>
            void pressNavigate(navigation, 'NotificationPreferences')
          )}
          {menuRow('shield-outline', t('settings.privacySettings'), undefined, () =>
            void pressNavigate(navigation, 'PrivacySettings')
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.appPreferences')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {menuRow('language-outline', t('settings.language'), languageSubtitle, () => setLangSheet(true))}
          {menuRow('cash-outline', t('settings.currency'), currencySubtitle, () => setCurrencySheet(true))}
          {menuRow('moon-outline', t('settings.darkMode'), isDarkMode ? t('settings.darkModeOn') : t('settings.darkModeOff'), () => {}, {
            rightElement: (
              <Switch
                value={isDarkMode}
                onValueChange={(v) => void onDarkToggle(v)}
                trackColor={{ false: colors.border, true: colors.secondary }}
              />
            ),
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('settings.legal')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {menuRow('document-text-outline', t('settings.privacyPolicy'), undefined, () =>
            openLink(LEGAL_URLS.privacy, LEGAL_URLS.privacyFallback)
          )}
          {menuRow('document-outline', t('settings.terms'), undefined, () =>
            openLink(LEGAL_URLS.terms, LEGAL_URLS.termsFallback)
          )}
          {menuRow('information-circle-outline', t('settings.aboutZuba'), undefined, () =>
            void pressNavigate(navigation, 'SettingsAbout')
          )}
        </View>

        <Text style={[styles.sectionLabel, styles.dangerLabel]}>{t('settings.dangerZone')}</Text>
        <View style={[styles.card, styles.dangerCard]}>
          {menuRow(
            'trash-outline',
            t('settings.deleteAccount'),
            t('settings.deleteAccountSub'),
            () => {
              void lightHaptic();
              setDeleteConfirmText('');
              setDeleteStep('warn');
            },
            { danger: true }
          )}
        </View>
      </ScrollView>

      <PickerSheet
        visible={langSheet}
        title={t('language.select')}
        options={[
          { value: 'en' as AppLang, label: `🇬🇧 ${t('language.english')}` },
          { value: 'fr' as AppLang, label: `🇫🇷 ${t('language.french')}` },
        ]}
        selected={selectedLang}
        onSelect={(v) => void onLanguageSelect(v)}
        onClose={() => setLangSheet(false)}
        hint={t('language.restartNote')}
      />

      <PickerSheet
        visible={currencySheet}
        title={t('currency.select')}
        options={[
          { value: 'CAD' as CurrencyCode, label: `🇨🇦 CAD — ${t('currency.cad')}` },
          { value: 'USD' as CurrencyCode, label: `🇺🇸 USD — ${t('currency.usd')}` },
          { value: 'EUR' as CurrencyCode, label: `🇪🇺 EUR — ${t('currency.eur')}` },
        ]}
        selected={currency}
        onSelect={(v) => void onCurrencySelect(v)}
        onClose={() => setCurrencySheet(false)}
        hint={t('currency.approximate')}
        footer={
          <TouchableOpacity
            style={{ paddingVertical: 12, alignItems: 'center' }}
            onPress={() => {
              void resetToAutoDetect().then(() => {
                setCurrencySheet(false);
                showSuccess(t('common.success'), t('currency.autoDetected'));
              });
            }}
          >
            <Text style={{ color: colors.secondary, fontWeight: '600' }}>
              {t('settings.resetCurrencyAuto')}
            </Text>
          </TouchableOpacity>
        }
      />

      {renderDeleteSheet(
        deleteStep === 'warn',
        <>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('deleteAccount.step1Title')}</Text>
          <Text style={[styles.sheetBody, { color: colors.textMuted }]}>{t('deleteAccount.step1Body')}</Text>
          <View style={styles.sheetActions}>
            <TouchableOpacity onPress={closeDeleteFlow} hitSlop={12}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{t('deleteAccount.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => {
                setDeleteConfirmText('');
                setDeleteStep('confirm');
              }}
            >
              <Text style={styles.continueBtnText}>{t('deleteAccount.continue')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {renderDeleteSheet(
        deleteStep === 'confirm',
        <>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('deleteAccount.step2Title')}</Text>
          <Text style={[styles.sheetHint, { color: colors.textMuted }]}>{t('deleteAccount.step2Body')}</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            placeholder={deleteConfirmWord}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (deleteConfirmText.trim().toUpperCase() === deleteConfirmWord.toUpperCase()) {
                void runDeleteAccount();
              }
            }}
          />
          <View style={styles.sheetActions}>
            <TouchableOpacity onPress={closeDeleteFlow} hitSlop={12}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{t('deleteAccount.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteBtn,
                deleteConfirmText.trim().toUpperCase() !== deleteConfirmWord.toUpperCase() && {
                  opacity: 0.45,
                },
              ]}
              disabled={deleteConfirmText.trim().toUpperCase() !== deleteConfirmWord.toUpperCase()}
              onPress={() => void runDeleteAccount()}
            >
              <Text style={styles.deleteBtnText}>{t('deleteAccount.deleteButton')}</Text>
            </TouchableOpacity>
          </View>
        </>,
        { keyboard: true }
      )}

      {renderDeleteSheet(
        deleteStep === 'processing',
        <>
          <View style={styles.processingSheet}>
            <ActivityIndicator size="large" color={colors.danger} />
            <Text style={{ marginTop: 12, color: colors.text }}>{t('deleteAccount.deleting')}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  dangerLabel: { color: '#dc2626', opacity: 1 },
  card: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  dangerCard: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fecaca' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapDanger: { backgroundColor: '#fee2e2' },
  rowText: { flex: 1, marginLeft: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetOverlayInner: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  sheetTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sheetHint: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  sheetBody: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  sheetActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  continueBtn: { backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  continueBtnText: { color: '#fff', fontWeight: '700' },
  input: { borderWidth: 2, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  deleteBtn: { backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  deleteBtnText: { color: '#fff', fontWeight: '700' },
  processingSheet: { alignItems: 'center', paddingVertical: 32 },
});

export default SettingsScreen;

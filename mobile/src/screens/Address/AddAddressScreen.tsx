/**
 * Add New Address — International smart form
 * Google Places autocomplete, international phone with country flag, country dropdown.
 * Fast, minimal, mobile-optimized (debounce 300ms, cache, validation).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../../services/address.service';
import { searchAddress, fetchAddressDetails, AddressSuggestion } from '../../services/addressAutocomplete.service';
import { parsePhone as parsePhoneApi } from '../../services/phoneAutocomplete.service';
import { Address } from '../../types/address.types';
import Colors from '../../constants/colors';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import {
  COUNTRIES,
  getCountryFlag,
  getCountryByCode,
  getCallingCode,
  CountryOption,
} from '../../constants/countries';

interface AddAddressParams {
  onSave?: (address: any) => void;
  editAddress?: any;
  isGuestCheckout?: boolean;
}

const DEBOUNCE_MS = 300;

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { onSave, editAddress, isGuestCheckout } = (route.params || {}) as AddAddressParams;
  const isGuest = isGuestCheckout === true || !isAuthenticated;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('CA');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [phoneCountryModalVisible, setPhoneCountryModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada',
    countryCode: 'CA',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneParseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editAddress) {
      const c = (editAddress as any).contactInfo;
      const a = (editAddress as any).address;
      const countryCode = (a?.countryCode || editAddress.countryCode || 'CA').toUpperCase();
      const countryName = a?.country || editAddress.country || 'Canada';
      const name = editAddress.name || (c?.firstName || c?.lastName ? [c.firstName, c.lastName].filter(Boolean).join(' ') : '');
      setFormData({
        fullName: name,
        phone: editAddress.phone || c?.phone || '',
        addressLine1: a?.addressLine1 || editAddress.addressLine1 || '',
        addressLine2: a?.addressLine2 || editAddress.addressLine2 || '',
        city: a?.city || editAddress.city || '',
        state: a?.province || a?.provinceCode || editAddress.state || '',
        postalCode: a?.postalCode || editAddress.postalCode || '',
        country: countryName,
        countryCode,
        isDefault: editAddress.isDefault || false,
      });
      const p = (editAddress.phone || c?.phone || '').replace(/\s/g, '');
      if (p) {
        const toShow = p.startsWith('+') ? p : '+' + p.replace(/\D/g, '');
        setPhoneDisplay(toShow);
        parsePhoneApi(toShow).then((res) => {
          if (res.valid && res.countryCode) setPhoneCountryCode(res.countryCode);
        });
      } else {
        const match = getCountryByCode(countryCode);
        if (match) setPhoneCountryCode(match.code);
      }
    }
  }, [editAddress]);

  const applySuggestion = useCallback(
    async (s: AddressSuggestion) => {
      if (s.placeId) {
        setSearchingAddress(true);
        try {
          const details = await fetchAddressDetails(s.placeId);
          if (details) {
            const countryCode = (details.countryCode || 'CA').toUpperCase();
            const countryName = details.country || formData.country;
            const match = COUNTRIES.find(
              (c) => c.code === countryCode || c.name === countryName
            );
            const resolvedCode = match ? match.code : countryCode;
            const resolvedName = match ? match.name : countryName;
            setFormData((prev) => ({
              ...prev,
              addressLine1: details.addressLine1 || prev.addressLine1,
              addressLine2: details.addressLine2 || prev.addressLine2,
              city: details.city || prev.city,
              state: details.state || prev.state,
              postalCode: details.postalCode || prev.postalCode,
              country: resolvedName,
              countryCode: resolvedCode,
            }));
            if (match) setPhoneCountryCode(match.code);
          }
        } catch {
          Alert.alert('Address', 'Could not load address details. Try again or enter manually.');
        } finally {
          setSearchingAddress(false);
        }
      } else {
        const countryCode = (s.countryCode || 'CA').toUpperCase();
        const countryName = s.country || formData.country;
        const match = COUNTRIES.find((c) => c.code === countryCode || c.name === countryName);
        const resolvedCode = match ? match.code : countryCode;
        const resolvedName = match ? match.name : countryName;
        setFormData((prev) => ({
          ...prev,
          addressLine1: s.addressLine1 || prev.addressLine1,
          addressLine2: s.addressLine2 || prev.addressLine2,
          city: s.city || prev.city,
          state: s.state || prev.state,
          postalCode: s.postalCode || prev.postalCode,
          country: resolvedName,
          countryCode: resolvedCode,
        }));
        if (match) setPhoneCountryCode(match.code);
      }
      setAddressSuggestions([]);
      setSuggestionsVisible(false);
      setSearchQuery('');
    },
    [formData.country]
  );

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setAddressSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const results = await searchAddress(searchQuery.trim());
        setAddressSuggestions(results);
        setSuggestionsVisible(results.length > 0);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setSearchingAddress(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const digits = phoneDisplay.replace(/\D/g, '');
    if (digits.length < 10) {
      return;
    }
    if (phoneParseDebounceRef.current) clearTimeout(phoneParseDebounceRef.current);
    phoneParseDebounceRef.current = setTimeout(async () => {
      const withPlus = phoneDisplay.startsWith('+') ? phoneDisplay : '+' + phoneDisplay.replace(/\D/g, '');
      const result = await parsePhoneApi(withPlus);
      if (result.valid && result.countryCode) {
        setPhoneCountryCode(result.countryCode);
        setFormData((prev) => ({ ...prev, phone: result.e164 || prev.phone }));
      }
    }, DEBOUNCE_MS);
    return () => {
      if (phoneParseDebounceRef.current) clearTimeout(phoneParseDebounceRef.current);
    };
  }, [phoneDisplay]);

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    const digits = phoneDisplay.replace(/\D/g, '');
    if (digits.length < 1) e.phone = 'Phone is required';
    if (!formData.addressLine1.trim()) e.addressLine1 = 'Street address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.postalCode.trim()) e.postalCode = 'Postal code is required';
    if (!formData.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const fullPhone = phoneDisplay.startsWith('+') ? phoneDisplay : '+' + phoneDisplay.replace(/\D/g, '');
    const phoneResult = await parsePhoneApi(fullPhone);
    const phoneE164 = (phoneResult.valid && phoneResult.e164) ? phoneResult.e164 : fullPhone;
    const name = formData.fullName.trim();
    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      setLoading(true);
      const payload = {
        firstName,
        lastName,
        phone: phoneE164,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        province: formData.state.trim(),
        provinceCode: formData.state.trim().slice(0, 2).toUpperCase(),
        postalCode: formData.postalCode.trim().toUpperCase(),
        country: formData.country.trim(),
        countryCode: formData.countryCode.trim().toUpperCase(),
        isDefault: formData.isDefault,
        contactInfo: {
          firstName,
          lastName,
          phone: phoneE164,
        },
        address: {
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          province: formData.state.trim(),
          provinceCode: formData.state.trim().slice(0, 2).toUpperCase(),
          postalCode: formData.postalCode.trim().toUpperCase(),
          country: formData.country.trim(),
          countryCode: formData.countryCode.trim().toUpperCase(),
        },
      };

      if (isGuest) {
        const guestAddress: Address = {
          _id: 'guest-' + Date.now(),
          name,
          phone: phoneE164,
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim(),
          isDefault: false,
        };
        if (onSave) onSave(guestAddress);
        navigation.goBack();
        return;
      }

      let response;
      if (editAddress?._id) {
        response = await addressService.updateAddress(editAddress._id, payload as any);
      } else {
        response = await addressService.addAddress(payload as any);
      }
      if (response.success && response.data) {
        if (onSave) onSave(response.data);
        navigation.goBack();
      } else {
        Alert.alert('Error', (response as any).message || 'Failed to save address');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (c: CountryOption) => {
    setFormData((prev) => ({ ...prev, country: c.name, countryCode: c.code }));
    setCountryModalVisible(false);
  };

  const selectPhoneCountry = (c: CountryOption) => {
    setPhoneCountryCode(c.code);
    setPhoneCountryModalVisible(false);
  };

  const renderInput = (
    label: string,
    field: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    options?: { keyboardType?: 'default' | 'phone-pad'; autoCapitalize?: 'none' | 'words' | 'characters' }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  const phoneCallingCode = getCallingCode(phoneCountryCode);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editAddress ? 'Edit Address' : 'Add New Address'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {renderInput('Full name', 'fullName', formData.fullName, (v) => setFormData({ ...formData, fullName: v }), 'Full name', { autoCapitalize: 'words' })}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone *</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.phonePrefixTouch}
                onPress={() => setPhoneCountryModalVisible(true)}
              >
                <Text style={styles.phoneFlag}>{getCountryFlag(phoneCountryCode)}</Text>
                <Text style={styles.phoneCallingCode}>+{phoneCallingCode || '1'}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone && styles.inputError]}
                value={phoneCallingCode ? phoneDisplay.replace(new RegExp('^\\+' + String(phoneCallingCode).replace(/[+()]/g, '')), '').trim() : phoneDisplay}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '');
                  const code = getCallingCode(phoneCountryCode) || '1';
                  setPhoneDisplay(code ? '+' + code + digits : (digits ? '+' + digits : ''));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="555 123 4567"
                placeholderTextColor={Colors.placeholder}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Search address</Text>
            <View style={styles.searchInputWrap}>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="e.g. 123 King St W, Toronto"
                placeholderTextColor={Colors.placeholder}
                onFocus={() => searchQuery.length >= 2 && setSuggestionsVisible(addressSuggestions.length > 0)}
              />
              {searchingAddress && (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.searchLoader} />
              )}
            </View>
            {suggestionsVisible && addressSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                <FlatList
                  data={addressSuggestions}
                  keyExtractor={(_, i) => String(i)}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => applySuggestion(item)}>
                      <Ionicons name="location-outline" size={18} color={Colors.primary} />
                      <Text style={styles.suggestionText} numberOfLines={2}>
                        {item.displayName}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
          {renderInput('Street', 'addressLine1', formData.addressLine1, (v) => setFormData({ ...formData, addressLine1: v }), '123 Main Street', { autoCapitalize: 'words' })}
          {renderInput('Apartment / Unit (optional)', 'addressLine2', formData.addressLine2, (v) => setFormData({ ...formData, addressLine2: v }), 'Apt 4B')}
          <View style={styles.row}>
            <View style={styles.half}>
              {renderInput('City', 'city', formData.city, (v) => setFormData({ ...formData, city: v }), 'Toronto', { autoCapitalize: 'words' })}
            </View>
            <View style={styles.half}>
              {renderInput('State / Province', 'state', formData.state, (v) => setFormData({ ...formData, state: v }), 'Ontario', { autoCapitalize: 'words' })}
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              {renderInput('Postal code', 'postalCode', formData.postalCode, (v) => setFormData({ ...formData, postalCode: v.toUpperCase() }), 'A1A 1A1', { autoCapitalize: 'characters' })}
            </View>
            <View style={styles.half}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Country</Text>
                <TouchableOpacity
                  style={[styles.input, styles.countryTouch, errors.country && styles.inputError]}
                  onPress={() => setCountryModalVisible(true)}
                >
                  <Text style={styles.countryTouchText} numberOfLines={1}>
                    {getCountryFlag(formData.countryCode)} {formData.country || 'Select country'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                </TouchableOpacity>
                {errors.country ? <Text style={styles.errorText}>{errors.country}</Text> : null}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
        >
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
            {formData.isDefault && <Ionicons name="checkmark" size={14} color={Colors.white} />}
          </View>
          <Text style={styles.defaultText}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Address</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCountryModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectCountry(item)}
                >
                  <Text style={styles.modalItemFlag}>{getCountryFlag(item.code)}</Text>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {formData.countryCode === item.code && (
                    <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={phoneCountryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhoneCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPhoneCountryModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phone country</Text>
              <TouchableOpacity onPress={() => setPhoneCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES.filter((c) => c.callingCode)}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectPhoneCountry(item)}
                >
                  <Text style={styles.modalItemFlag}>{getCountryFlag(item.code)}</Text>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemCode}>+{item.callingCode}</Text>
                  {phoneCountryCode === item.code && (
                    <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerPlaceholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: { borderColor: '#E53935' },
  errorText: { fontSize: 12, color: '#E53935', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  phonePrefixTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  phoneFlag: { fontSize: 22 },
  phoneCallingCode: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    marginLeft: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchInputWrap: { position: 'relative' },
  searchLoader: { position: 'absolute', right: 12, top: 38 },
  suggestionsBox: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 220,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: { flex: 1, fontSize: 14, color: Colors.primary },
  countryTouch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countryTouchText: { fontSize: 16, color: Colors.primary, flex: 1 },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  defaultText: { fontSize: 14, fontWeight: '500', color: Colors.primary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemFlag: { fontSize: 22 },
  modalItemText: { flex: 1, fontSize: 16, color: Colors.primary },
  modalItemCode: { fontSize: 14, color: Colors.primary, opacity: 0.8 },
});

export default AddAddressScreen;

/**
 * Add Address Screen
 * Web-style design: Contact (first/last name, phone with country code), Delivery Address with autofill
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../../services/address.service';
import { searchAddress, fetchAddressDetails, AddressSuggestion } from '../../services/addressAutocomplete.service';
import { parsePhone as parsePhoneApi } from '../../services/phoneAutocomplete.service';
import { AddressFormData, Address } from '../../types/address.types';
import Colors from '../../constants/colors';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const a = 0x1F1E6;
  const b = countryCode.toUpperCase().charCodeAt(0) - 65 + a;
  const c = countryCode.toUpperCase().charCodeAt(1) - 65 + a;
  return String.fromCodePoint(b, c);
}

interface AddAddressParams {
  onSave?: (address: any) => void;
  editAddress?: any;
  isGuestCheckout?: boolean;
}

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
  const [usingLocation, setUsingLocation] = useState(false);
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneCountryFlag, setPhoneCountryFlag] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
      setFormData({
        firstName: c?.firstName || (editAddress.name || '').split(' ')[0] || '',
        lastName: c?.lastName || (editAddress.name || '').split(' ').slice(1).join(' ') || '',
        phone: editAddress.phone || c?.phone || '',
        addressLine1: a?.addressLine1 || editAddress.addressLine1 || '',
        addressLine2: a?.addressLine2 || editAddress.addressLine2 || '',
        city: a?.city || editAddress.city || '',
        state: a?.province || a?.provinceCode || editAddress.state || '',
        postalCode: a?.postalCode || editAddress.postalCode || '',
        country: a?.country || editAddress.country || 'Canada',
        countryCode: a?.countryCode || 'CA',
        isDefault: editAddress.isDefault || false,
      });
      const p = (editAddress.phone || c?.phone || '').replace(/\s/g, '');
      if (p) {
        const toShow = p.startsWith('+') ? p : '+' + p.replace(/\D/g, '');
        setPhoneDisplay(toShow);
        parsePhoneApi(toShow).then(res => {
          if (res.valid && res.countryCode) setPhoneCountryFlag(res.countryCode);
        });
      } else {
        setPhoneCountryFlag('');
      }
    }
  }, [editAddress]);

  const applySuggestion = useCallback(async (s: AddressSuggestion) => {
    if (s.placeId) {
      setSearchingAddress(true);
      try {
        const details = await fetchAddressDetails(s.placeId);
        if (details) {
          setFormData(prev => ({
            ...prev,
            addressLine1: details.addressLine1 || prev.addressLine1,
            addressLine2: details.addressLine2 || prev.addressLine2,
            city: details.city || prev.city,
            state: details.state || prev.state,
            postalCode: details.postalCode || prev.postalCode,
            country: details.country || prev.country,
            countryCode: details.countryCode || prev.countryCode,
          }));
        }
      } catch {
        Alert.alert('Address', 'Could not load address details. Try again or enter manually.');
      } finally {
        setSearchingAddress(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        addressLine1: s.addressLine1 || prev.addressLine1,
        addressLine2: s.addressLine2 || prev.addressLine2,
        city: s.city || prev.city,
        state: s.state || prev.state,
        postalCode: s.postalCode || prev.postalCode,
        country: s.country || prev.country,
        countryCode: s.countryCode || prev.countryCode,
      }));
    }
    setAddressSuggestions([]);
    setSuggestionsVisible(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
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
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // When user types phone, detect country and show flag via backend
  useEffect(() => {
    const digits = phoneDisplay.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneCountryFlag('');
      return;
    }
    if (phoneParseDebounceRef.current) clearTimeout(phoneParseDebounceRef.current);
    phoneParseDebounceRef.current = setTimeout(async () => {
      const digits = phoneDisplay.replace(/\D/g, '');
      const withPlus = '+' + digits;
      const result = await parsePhoneApi(withPlus);
      if (result.valid && result.countryCode) {
        setPhoneCountryFlag(result.countryCode);
        setFormData(prev => ({ ...prev, phone: result.e164 || prev.phone }));
      } else {
        setPhoneCountryFlag('');
      }
    }, 400);
    return () => {
      if (phoneParseDebounceRef.current) clearTimeout(phoneParseDebounceRef.current);
    };
  }, [phoneDisplay]);

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    const digits = phoneDisplay.replace(/\D/g, '');
    if (digits.length < 10) e.phone = 'Valid phone number is required';
    if (!formData.addressLine1.trim()) e.addressLine1 = 'Street address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.state.trim()) e.state = 'Province/State is required';
    if (!formData.postalCode.trim()) e.postalCode = 'Postal code is required';
    if (!formData.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const digits = phoneDisplay.replace(/\D/g, '');
    const fullPhone = '+' + digits;
    const phoneResult = await parsePhoneApi(fullPhone);
    if (!phoneResult.valid) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      return;
    }
    const phoneE164 = phoneResult.e164 || fullPhone;
    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    try {
      setLoading(true);
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
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
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
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
        placeholderTextColor={`${Colors.primary}40`}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

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
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.row}>
            <View style={styles.half}>{renderInput('First Name', 'firstName', formData.firstName, v => setFormData({ ...formData, firstName: v }), 'John', { autoCapitalize: 'words' })}</View>
            <View style={styles.half}>{renderInput('Last Name', 'lastName', formData.lastName, v => setFormData({ ...formData, lastName: v }), 'Doe', { autoCapitalize: 'words' })}</View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneRow}>
              {phoneCountryFlag ? (
                <Text style={styles.phoneFlag}>{getCountryFlag(phoneCountryFlag)}</Text>
              ) : null}
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone && styles.inputError]}
                value={phoneDisplay}
                onChangeText={t => {
                  let s = t.replace(/[^\d+]/g, '');
                  if (s.startsWith('+')) s = '+' + s.slice(1).replace(/\D/g, '');
                  else s = s.replace(/\D/g, '');
                  setPhoneDisplay(s.slice(0, 16));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                placeholder="+1 555 123 4567"
                placeholderTextColor={`${Colors.primary}40`}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Search address</Text>
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Start typing your address..."
              placeholderTextColor={`${Colors.primary}40`}
              onFocus={() => searchQuery.length >= 3 && setSuggestionsVisible(addressSuggestions.length > 0)}
            />
            {searchingAddress && <ActivityIndicator size="small" color={Colors.primary} style={styles.searchLoader} />}
            {suggestionsVisible && addressSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                <FlatList
                  data={addressSuggestions}
                  keyExtractor={(_, i) => String(i)}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => applySuggestion(item)}>
                      <Ionicons name="location-outline" size={18} color={Colors.primary} />
                      <Text style={styles.suggestionText} numberOfLines={2}>{item.displayName}</Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
          {renderInput('Street Address', 'addressLine1', formData.addressLine1, v => setFormData({ ...formData, addressLine1: v }), '123 Main Street', { autoCapitalize: 'words' })}
          {renderInput('Apt, Suite, Unit (Optional)', 'addressLine2', formData.addressLine2, v => setFormData({ ...formData, addressLine2: v }), 'Apt 4B')}
          <View style={styles.row}>
            <View style={styles.half}>{renderInput('City', 'city', formData.city, v => setFormData({ ...formData, city: v }), 'Toronto', { autoCapitalize: 'words' })}</View>
            <View style={styles.half}>{renderInput('Province/State', 'state', formData.state, v => setFormData({ ...formData, state: v }), 'Ontario', { autoCapitalize: 'words' })}</View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>{renderInput('Postal Code', 'postalCode', formData.postalCode, v => setFormData({ ...formData, postalCode: v.toUpperCase() }), 'A1A 1A1', { autoCapitalize: 'characters' })}</View>
            <View style={styles.half}>{renderInput('Country', 'country', formData.country, v => setFormData({ ...formData, country: v }), 'Canada', { autoCapitalize: 'words' })}</View>
          </View>
        </View>

        <TouchableOpacity style={styles.defaultToggle} onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}>
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
            {formData.isDefault && <Ionicons name="checkmark" size={14} color={Colors.white} />}
          </View>
          <Text style={styles.defaultText}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, loading && styles.saveButtonDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={Colors.white} /> : (<><Ionicons name="checkmark" size={20} color={Colors.white} /><Text style={styles.saveButtonText}>{editAddress ? 'Update Address' : 'Save Address'}</Text></>)}
        </TouchableOpacity>
      </View>
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
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerPlaceholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.primary, marginBottom: 16 },
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
  },
  inputError: { borderColor: '#FF5252' },
  errorText: { fontSize: 12, color: '#FF5252', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneFlag: { fontSize: 24 },
  phoneInput: { flex: 1, minWidth: 0 },
  searchLoader: { position: 'absolute', right: 12, top: 38 },
  suggestionsBox: { marginTop: 4, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, maxHeight: 200 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { flex: 1, fontSize: 14, color: Colors.primary },
  defaultToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  defaultText: { fontSize: 14, fontWeight: '500', color: Colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: Colors.border },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white, marginLeft: 8 },
});

export default AddAddressScreen;

/**
 * Add Address Screen
 * Form to add new shipping/billing address
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../../services/address.service';
import { AddressFormData } from '../../types/address.types';
import Colors from '../../constants/colors';

interface AddAddressParams {
  onSave?: (address: any) => void;
  editAddress?: any;
}

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { onSave, editAddress } = (route.params || {}) as AddAddressParams;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    name: editAddress?.name || '',
    phone: editAddress?.phone || '',
    addressLine1: editAddress?.addressLine1 || '',
    addressLine2: editAddress?.addressLine2 || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    postalCode: editAddress?.postalCode || '',
    country: editAddress?.country || 'Canada',
    isDefault: editAddress?.isDefault || false,
  });

  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Province/State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let response;
      if (editAddress?._id) {
        response = await addressService.updateAddress(editAddress._id, formData);
      } else {
        response = await addressService.addAddress(formData);
      }

      if (response.success) {
        if (onSave && response.data) {
          onSave(response.data);
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to save address');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof AddressFormData,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'phone-pad' | 'email-address';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError,
          options?.multiline && styles.inputMultiline,
        ]}
        value={String(formData[field])}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={`${Colors.primary}40`}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
        multiline={options?.multiline}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
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
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderInput('Full Name', 'name', 'John Doe', {
            autoCapitalize: 'words',
          })}
          {renderInput('Phone Number', 'phone', '+1 (555) 123-4567', {
            keyboardType: 'phone-pad',
          })}
        </View>

        {/* Address Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          {renderInput('Street Address', 'addressLine1', '123 Main Street', {
            autoCapitalize: 'words',
          })}
          {renderInput('Apt, Suite, Building (Optional)', 'addressLine2', 'Apt 4B')}

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={formData.city}
                onChangeText={(text) => {
                  setFormData({ ...formData, city: text });
                  if (errors.city) setErrors({ ...errors, city: undefined });
                }}
                placeholder="Toronto"
                placeholderTextColor={`${Colors.primary}40`}
                autoCapitalize="words"
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Province/State</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                value={formData.state}
                onChangeText={(text) => {
                  setFormData({ ...formData, state: text });
                  if (errors.state) setErrors({ ...errors, state: undefined });
                }}
                placeholder="Ontario"
                placeholderTextColor={`${Colors.primary}40`}
                autoCapitalize="words"
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={[styles.input, errors.postalCode && styles.inputError]}
                value={formData.postalCode}
                onChangeText={(text) => {
                  setFormData({ ...formData, postalCode: text.toUpperCase() });
                  if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                }}
                placeholder="M5V 2T6"
                placeholderTextColor={`${Colors.primary}40`}
                autoCapitalize="characters"
              />
              {errors.postalCode && (
                <Text style={styles.errorText}>{errors.postalCode}</Text>
              )}
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={[styles.input, errors.country && styles.inputError]}
                value={formData.country}
                onChangeText={(text) => {
                  setFormData({ ...formData, country: text });
                  if (errors.country) setErrors({ ...errors, country: undefined });
                }}
                placeholder="Canada"
                placeholderTextColor={`${Colors.primary}40`}
                autoCapitalize="words"
              />
              {errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
        >
          <View
            style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxChecked,
            ]}
          >
            {formData.isDefault && (
              <Ionicons name="checkmark" size={14} color={Colors.white} />
            )}
          </View>
          <Text style={styles.defaultText}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
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
              <Text style={styles.saveButtonText}>
                {editAddress ? 'Update Address' : 'Save Address'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
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
  inputError: {
    borderColor: '#FF5252',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
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
  checkboxChecked: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  defaultText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
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
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
});

export default AddAddressScreen;

import React, { useState, useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './AddressForm.css';

const libraries = ['places'];

const GOOGLE_API_KEY = 'AIzaSyAXshkwQXMY74fgEi0e02sTz8sKNphLM_U';

/**
 * AddressForm Component with Google Places Autocomplete
 * Default Country: Canada
 * Supports both new and old address formats
 */
const AddressForm = ({ onAddressSave, initialAddress = null, mode = 'checkout' }) => {
  const [formData, setFormData] = useState({
    // Contact Info
    firstName: initialAddress?.contactInfo?.firstName || initialAddress?.firstName || '',
    lastName: initialAddress?.contactInfo?.lastName || initialAddress?.lastName || '',
    phone: initialAddress?.contactInfo?.phone || initialAddress?.mobile ? `+${initialAddress.mobile}` : '+1',
    email: initialAddress?.contactInfo?.email || initialAddress?.email || '',
    
    // Address
    addressLine1: initialAddress?.address?.addressLine1 || initialAddress?.address_line1 || '',
    addressLine2: initialAddress?.address?.addressLine2 || initialAddress?.landmark || '',
    city: initialAddress?.address?.city || initialAddress?.city || '',
    province: initialAddress?.address?.province || initialAddress?.state || '',
    provinceCode: initialAddress?.address?.provinceCode || initialAddress?.state || '',
    postalCode: initialAddress?.address?.postalCode || initialAddress?.pincode || '',
    country: initialAddress?.address?.country || initialAddress?.country || 'Canada',
    countryCode: initialAddress?.address?.countryCode || 'CA',
    
    // Preferences
    label: initialAddress?.label || initialAddress?.addressType || '',
    notes: initialAddress?.notes || '',
    isDefault: initialAddress?.isDefault || false,
    
    // Google Places Data
    placeId: initialAddress?.googlePlaces?.placeId || '',
    coordinates: initialAddress?.googlePlaces?.coordinates || { lat: null, lng: null }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autocompleteInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps Script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && autocompleteInputRef.current && !autocompleteRef.current) {
      // Worldwide support with Canada as default bias
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          // No country restrictions - allow worldwide addresses
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: ['address'],
          // Bias to Canada but allow all countries
          componentRestrictions: undefined
        }
      );
      
      // Worldwide search enabled - no country restrictions

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          fillAddressFromPlace(place);
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isLoaded]);

  // Fill form from Google Places result
  const fillAddressFromPlace = (place) => {
    const components = {};
    place.address_components.forEach((component) => {
      const type = component.types[0];
      components[type] = {
        long: component.long_name,
        short: component.short_name
      };
    });

    const streetNumber = components.street_number?.long || '';
    const streetName = components.route?.long || '';
    const city = components.locality?.long || 
                 components.administrative_area_level_2?.long || '';
    const province = components.administrative_area_level_1?.long || '';
    const provinceCode = components.administrative_area_level_1?.short || '';
    const country = components.country?.long || 'Canada';
    const countryCode = components.country?.short || 'CA';
    const postalCode = components.postal_code?.long || '';

    setFormData(prev => ({
      ...prev,
      addressLine1: `${streetNumber} ${streetName}`.trim(),
      city,
      province,
      provinceCode,
      country,
      countryCode,
      postalCode,
      placeId: place.place_id,
      coordinates: {
        lat: place.geometry?.location?.lat() || null,
        lng: place.geometry?.location?.lng() || null
      }
    }));

    // Clear errors for auto-filled fields
    setErrors(prev => ({
      ...prev,
      addressLine1: '',
      city: '',
      province: '',
      postalCode: ''
    }));
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle phone change
  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value || '+1' }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Contact info validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone || formData.phone === '+1') {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (mode === 'checkout' && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Address validation
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'Province/State is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else {
      // Validate postal code based on country (flexible validation for worldwide)
      const postalCodeRegex = formData.countryCode === 'CA' 
        ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
        : formData.countryCode === 'US'
        ? /^\d{5}(-\d{4})?$/
        : /^.{3,10}$/; // Generic validation for other countries (3-10 characters)
      
      if (!postalCodeRegex.test(formData.postalCode)) {
        newErrors.postalCode = formData.countryCode === 'CA' 
          ? 'Invalid format (e.g., A1A 1A1)' 
          : formData.countryCode === 'US'
          ? 'Invalid format (e.g., 12345)'
          : 'Please enter a valid postal code';
      }
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format address data for backend
      const addressData = {
        contactInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone,
          email: formData.email?.trim() || undefined
        },
        address: {
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          provinceCode: formData.provinceCode.toUpperCase(),
          country: formData.country,
          countryCode: formData.countryCode.toUpperCase(),
          postalCode: formData.postalCode.toUpperCase().replace(/\s+/g, ' ').trim()
        },
        googlePlaces: {
          placeId: formData.placeId,
          formattedAddress: `${formData.addressLine1}, ${formData.city}, ${formData.province} ${formData.postalCode}, ${formData.country}`,
          coordinates: formData.coordinates
        },
        label: formData.label.trim(),
        notes: formData.notes.trim(),
        isDefault: formData.isDefault,
        // Old format for backward compatibility
        addressType: formData.label || 'Home',
        address_line1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.province.trim(),
        pincode: formData.postalCode.toUpperCase().replace(/\s+/g, ''),
        country: formData.country,
        mobile: parseInt(formData.phone.replace(/\D/g, '').substring(0, 15)) || null,
        landmark: formData.addressLine2.trim()
      };

      // Call parent callback
      await onAddressSave(addressData);
      
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save address. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="address-form-error">
        <p>Error loading Google Maps. Please refresh the page.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="address-form-loading">
        <p>Loading address form...</p>
      </div>
    );
  }

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      {/* Contact Information */}
      <div className="form-section">
        <h3 className="section-title">Contact Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="John"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Doe"
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <PhoneInput
              international
              defaultCountry="CA"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={errors.phone ? 'error' : ''}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          {mode === 'checkout' && (
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="john@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="form-section">
        <h3 className="section-title">Delivery Address</h3>
        
        <div className="form-group">
          <label htmlFor="addressAutocomplete">
            Search Address <span className="required">*</span>
          </label>
          <input
            ref={autocompleteInputRef}
            type="text"
            id="addressAutocomplete"
            placeholder="Start typing your address..."
            className="autocomplete-input"
          />
          <small className="form-hint">
            🇨🇦 Start typing to find your address (powered by Google)
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="addressLine1">
            Street Address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={errors.addressLine1 ? 'error' : ''}
            placeholder="123 Main Street"
          />
          {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="addressLine2">
            Apartment, Suite, Unit (Optional)
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Apt 4B"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
              placeholder="Toronto"
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="province">
              Province/State <span className="required">*</span>
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={errors.province ? 'error' : ''}
              placeholder="Ontario"
            />
            {errors.province && <span className="error-message">{errors.province}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="postalCode">
              Postal Code <span className="required">*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={errors.postalCode ? 'error' : ''}
              placeholder="A1A 1A1"
              maxLength="7"
            />
            {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="country">
              Country <span className="required">*</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={errors.country ? 'error' : ''}
              placeholder="Canada"
              required
            />
            {errors.country && <span className="error-message">{errors.country}</span>}
          </div>
        </div>
      </div>

      {/* Additional Options (for saved addresses) */}
      {mode === 'account' && (
        <div className="form-section">
          <h3 className="section-title">Address Options</h3>
          
          <div className="form-group">
            <label htmlFor="label">Address Label (Optional)</label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Home, Office, Mom's House..."
              maxLength="50"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Delivery Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ring the doorbell twice, leave at door..."
              rows="2"
              maxLength="200"
            />
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <span>Set as default delivery address</span>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="form-actions">
        {errors.submit && (
          <div className="submit-error">{errors.submit}</div>
        )}
        <button
          type="submit"
          className="btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'checkout' ? 'Continue to Payment' : 'Save Address'}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;


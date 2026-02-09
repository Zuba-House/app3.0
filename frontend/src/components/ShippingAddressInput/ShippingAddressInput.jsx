import React, { useState, useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './ShippingAddressInput.css';

const libraries = ['places'];
const GOOGLE_API_KEY = 'AIzaSyAXshkwQXMY74fgEi0e02sTz8sKNphLM_U';

/**
 * Shipping Address Input with Google Maps Autocomplete
 * Worldwide support for shipping rate calculation
 * Includes phone number with country auto-complete
 * Includes customer name, apartment/office number, and delivery notes
 */
const ShippingAddressInput = ({ 
  onAddressChange, 
  onPhoneChange, 
  onCustomerInfoChange,
  initialAddress = null, 
  initialPhone = '',
  initialCustomerName = '',
  initialApartmentNumber = '',
  initialDeliveryNote = ''
}) => {
  const [address, setAddress] = React.useState({
    postal_code: initialAddress?.postal_code || initialAddress?.postalCode || initialAddress?.address?.postalCode || '',
    city: initialAddress?.city || initialAddress?.address?.city || '',
    province: initialAddress?.province || initialAddress?.provinceCode || initialAddress?.address?.provinceCode || '',
    country: initialAddress?.country || initialAddress?.countryCode || initialAddress?.address?.countryCode || 'CA',
    countryCode: initialAddress?.countryCode || initialAddress?.address?.countryCode || 'CA',
    coordinates: initialAddress?.coordinates || initialAddress?.googlePlaces?.coordinates || null,
    addressLine1: initialAddress?.addressLine1 || initialAddress?.address?.addressLine1 || '',
    addressLine2: initialAddress?.addressLine2 || initialAddress?.address?.addressLine2 || ''
  });
  const [phone, setPhone] = React.useState(initialPhone || '');
  const [phoneError, setPhoneError] = React.useState('');
  
  // New customer info fields
  const [customerName, setCustomerName] = React.useState(initialCustomerName || '');
  const [apartmentNumber, setApartmentNumber] = React.useState(initialApartmentNumber || '');
  const [deliveryNote, setDeliveryNote] = React.useState(initialDeliveryNote || '');

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
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: ['address'],
          // No country restrictions - worldwide support
          componentRestrictions: undefined
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          fillAddressFromPlace(place);
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isLoaded]);

  // Fill address from Google Places result
  const fillAddressFromPlace = (place) => {
    const components = {};
    place.address_components.forEach((component) => {
      // Store all types for this component
      component.types.forEach((type) => {
        if (!components[type]) {
          components[type] = {
            long: component.long_name,
            short: component.short_name
          };
        }
      });
    });

    const city = components.locality?.long || 
                 components.administrative_area_level_2?.long || 
                 components.postal_town?.long || '';
    const province = components.administrative_area_level_1?.long || '';
    const provinceCode = components.administrative_area_level_1?.short || '';
    const country = components.country?.long || '';
    const countryCode = components.country?.short || 'CA';
    const postalCode = components.postal_code?.long || '';
    
    // Extract street address
    const streetNumber = components.street_number?.long || '';
    const route = components.route?.long || '';
    const addressLine1 = [streetNumber, route].filter(Boolean).join(' ').trim() || place.formatted_address?.split(',')[0] || '';

    const newAddress = {
      postal_code: postalCode.replace(/\s/g, '').toUpperCase(),
      city: city,
      province: provinceCode || province,
      country: country,
      countryCode: countryCode,
      addressLine1: addressLine1,
      addressLine2: '',
      coordinates: {
        lat: place.geometry?.location?.lat() || null,
        lng: place.geometry?.location?.lng() || null
      }
    };

    setAddress(newAddress);
    onAddressChange && onAddressChange(newAddress);
  };

  const handleManualChange = (field, value) => {
    const newAddress = {
      ...address,
      [field]: value
    };
    setAddress(newAddress);
    onAddressChange && onAddressChange(newAddress);
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    setPhone(value || '');
    setPhoneError('');
    
    // Auto-update country code based on phone number if available
    if (value && typeof value === 'string') {
      // Extract country code from phone (react-phone-number-input handles this)
      // The library automatically detects country from phone number
    }
    
    onPhoneChange && onPhoneChange(value || '');
  };

  // Handle customer info changes
  const handleCustomerInfoChange = (field, value) => {
    const updates = {};
    
    if (field === 'customerName') {
      setCustomerName(value);
      updates.customerName = value;
    } else if (field === 'apartmentNumber') {
      setApartmentNumber(value);
      updates.apartmentNumber = value;
    } else if (field === 'deliveryNote') {
      setDeliveryNote(value);
      updates.deliveryNote = value;
    }
    
    // Notify parent of all customer info
    onCustomerInfoChange && onCustomerInfoChange({
      customerName: field === 'customerName' ? value : customerName,
      apartmentNumber: field === 'apartmentNumber' ? value : apartmentNumber,
      deliveryNote: field === 'deliveryNote' ? value : deliveryNote
    });
  };

  // Validate phone number
  const validatePhone = (phoneValue) => {
    if (!phoneValue || phoneValue.trim() === '') {
      setPhoneError('Phone number is required');
      return false;
    }
    
    // Basic validation - at least 10 digits
    const digitsOnly = phoneValue.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('Phone number must have at least 10 digits');
      return false;
    }
    
    if (digitsOnly.length > 15) {
      setPhoneError('Phone number is too long');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  if (loadError) {
    return (
      <div className="shipping-address-error">
        <p>⚠️ Unable to load address autocomplete. Please enter address manually.</p>
      </div>
    );
  }

  return (
    <div className="shipping-address-input">
      <h4 className="text-[14px] font-[600] mb-2">
        📍 Shipping Address <span className="text-red-500">*</span> (Required)
      </h4>
      <p className="text-[12px] text-gray-600 mb-3">
        Enter your shipping address to calculate shipping rates and proceed to checkout
      </p>
      
      {/* Google Maps Autocomplete */}
      {isLoaded && (
        <div className="form-group mb-3">
          <input
            ref={autocompleteInputRef}
            type="text"
            placeholder="🔍 Search your address (anywhere in the world)..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-[14px] mb-2"
          />
          <small className="text-gray-500 text-[12px]">
            Start typing to find your address (powered by Google Maps)
          </small>
        </div>
      )}

      {/* Manual Input Fields */}
      <div className="manual-inputs">
        <input
          type="text"
          placeholder="Postal/Zip Code *"
          value={address.postal_code}
          onChange={(e) => handleManualChange('postal_code', e.target.value.toUpperCase().replace(/\s/g, ''))}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-[14px]"
          maxLength={20}
          required
        />
        <input
          type="text"
          placeholder="City *"
          value={address.city}
          onChange={(e) => handleManualChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-[14px]"
          required
        />
        <input
          type="text"
          placeholder="State/Province *"
          value={address.province}
          onChange={(e) => handleManualChange('province', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-[14px]"
          required
        />
        <select
          value={address.countryCode}
          onChange={(e) => {
            const newAddr = {
              ...address,
              countryCode: e.target.value,
              country: e.target.options[e.target.selectedIndex].text
            };
            setAddress(newAddr);
            onAddressChange && onAddressChange(newAddr);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-[14px]"
          required
        >
          <option value="CA">Canada</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="AF">Afghanistan</option>
          <option value="AX">Åland Islands</option>
          <option value="AL">Albania</option>
          <option value="DZ">Algeria</option>
          <option value="AS">American Samoa</option>
          <option value="AD">Andorra</option>
          <option value="AO">Angola</option>
          <option value="AI">Anguilla</option>
          <option value="AQ">Antarctica</option>
          <option value="AG">Antigua and Barbuda</option>
          <option value="AR">Argentina</option>
          <option value="AM">Armenia</option>
          <option value="AW">Aruba</option>
          <option value="AU">Australia</option>
          <option value="AT">Austria</option>
          <option value="AZ">Azerbaijan</option>
          <option value="BS">Bahamas</option>
          <option value="BH">Bahrain</option>
          <option value="BD">Bangladesh</option>
          <option value="BB">Barbados</option>
          <option value="BY">Belarus</option>
          <option value="BE">Belgium</option>
          <option value="BZ">Belize</option>
          <option value="BJ">Benin</option>
          <option value="BM">Bermuda</option>
          <option value="BT">Bhutan</option>
          <option value="BO">Bolivia</option>
          <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
          <option value="BA">Bosnia and Herzegovina</option>
          <option value="BW">Botswana</option>
          <option value="BV">Bouvet Island</option>
          <option value="BR">Brazil</option>
          <option value="IO">British Indian Ocean Territory</option>
          <option value="BN">Brunei Darussalam</option>
          <option value="BG">Bulgaria</option>
          <option value="BF">Burkina Faso</option>
          <option value="BI">Burundi</option>
          <option value="CV">Cabo Verde</option>
          <option value="KH">Cambodia</option>
          <option value="CM">Cameroon</option>
          <option value="KY">Cayman Islands</option>
          <option value="CF">Central African Republic</option>
          <option value="TD">Chad</option>
          <option value="CL">Chile</option>
          <option value="CN">China</option>
          <option value="CX">Christmas Island</option>
          <option value="CC">Cocos (Keeling) Islands</option>
          <option value="CO">Colombia</option>
          <option value="KM">Comoros</option>
          <option value="CG">Congo</option>
          <option value="CD">Congo, Democratic Republic of the</option>
          <option value="CK">Cook Islands</option>
          <option value="CR">Costa Rica</option>
          <option value="CI">Côte d'Ivoire</option>
          <option value="HR">Croatia</option>
          <option value="CU">Cuba</option>
          <option value="CW">Curaçao</option>
          <option value="CY">Cyprus</option>
          <option value="CZ">Czechia</option>
          <option value="DK">Denmark</option>
          <option value="DJ">Djibouti</option>
          <option value="DM">Dominica</option>
          <option value="DO">Dominican Republic</option>
          <option value="EC">Ecuador</option>
          <option value="EG">Egypt</option>
          <option value="SV">El Salvador</option>
          <option value="GQ">Equatorial Guinea</option>
          <option value="ER">Eritrea</option>
          <option value="EE">Estonia</option>
          <option value="SZ">Eswatini</option>
          <option value="ET">Ethiopia</option>
          <option value="FK">Falkland Islands (Malvinas)</option>
          <option value="FO">Faroe Islands</option>
          <option value="FJ">Fiji</option>
          <option value="FI">Finland</option>
          <option value="FR">France</option>
          <option value="GF">French Guiana</option>
          <option value="PF">French Polynesia</option>
          <option value="TF">French Southern Territories</option>
          <option value="GA">Gabon</option>
          <option value="GM">Gambia</option>
          <option value="GE">Georgia</option>
          <option value="DE">Germany</option>
          <option value="GH">Ghana</option>
          <option value="GI">Gibraltar</option>
          <option value="GR">Greece</option>
          <option value="GL">Greenland</option>
          <option value="GD">Grenada</option>
          <option value="GP">Guadeloupe</option>
          <option value="GU">Guam</option>
          <option value="GT">Guatemala</option>
          <option value="GG">Guernsey</option>
          <option value="GN">Guinea</option>
          <option value="GW">Guinea-Bissau</option>
          <option value="GY">Guyana</option>
          <option value="HT">Haiti</option>
          <option value="HM">Heard Island and McDonald Islands</option>
          <option value="VA">Holy See</option>
          <option value="HN">Honduras</option>
          <option value="HK">Hong Kong</option>
          <option value="HU">Hungary</option>
          <option value="IS">Iceland</option>
          <option value="IN">India</option>
          <option value="ID">Indonesia</option>
          <option value="IR">Iran (Islamic Republic of)</option>
          <option value="IQ">Iraq</option>
          <option value="IE">Ireland</option>
          <option value="IM">Isle of Man</option>
          <option value="IL">Israel</option>
          <option value="IT">Italy</option>
          <option value="JM">Jamaica</option>
          <option value="JP">Japan</option>
          <option value="JE">Jersey</option>
          <option value="JO">Jordan</option>
          <option value="KZ">Kazakhstan</option>
          <option value="KE">Kenya</option>
          <option value="KI">Kiribati</option>
          <option value="KP">Korea (Democratic People's Republic of)</option>
          <option value="KR">Korea, Republic of</option>
          <option value="KW">Kuwait</option>
          <option value="KG">Kyrgyzstan</option>
          <option value="LA">Lao People's Democratic Republic</option>
          <option value="LV">Latvia</option>
          <option value="LB">Lebanon</option>
          <option value="LS">Lesotho</option>
          <option value="LR">Liberia</option>
          <option value="LY">Libya</option>
          <option value="LI">Liechtenstein</option>
          <option value="LT">Lithuania</option>
          <option value="LU">Luxembourg</option>
          <option value="MO">Macao</option>
          <option value="MG">Madagascar</option>
          <option value="MW">Malawi</option>
          <option value="MY">Malaysia</option>
          <option value="MV">Maldives</option>
          <option value="ML">Mali</option>
          <option value="MT">Malta</option>
          <option value="MH">Marshall Islands</option>
          <option value="MQ">Martinique</option>
          <option value="MR">Mauritania</option>
          <option value="MU">Mauritius</option>
          <option value="YT">Mayotte</option>
          <option value="MX">Mexico</option>
          <option value="FM">Micronesia (Federated States of)</option>
          <option value="MD">Moldova, Republic of</option>
          <option value="MC">Monaco</option>
          <option value="MN">Mongolia</option>
          <option value="ME">Montenegro</option>
          <option value="MS">Montserrat</option>
          <option value="MA">Morocco</option>
          <option value="MZ">Mozambique</option>
          <option value="MM">Myanmar</option>
          <option value="NA">Namibia</option>
          <option value="NR">Nauru</option>
          <option value="NP">Nepal</option>
          <option value="NL">Netherlands</option>
          <option value="NC">New Caledonia</option>
          <option value="NZ">New Zealand</option>
          <option value="NI">Nicaragua</option>
          <option value="NE">Niger</option>
          <option value="NG">Nigeria</option>
          <option value="NU">Niue</option>
          <option value="NF">Norfolk Island</option>
          <option value="MK">North Macedonia</option>
          <option value="MP">Northern Mariana Islands</option>
          <option value="NO">Norway</option>
          <option value="OM">Oman</option>
          <option value="PK">Pakistan</option>
          <option value="PW">Palau</option>
          <option value="PS">Palestine, State of</option>
          <option value="PA">Panama</option>
          <option value="PG">Papua New Guinea</option>
          <option value="PY">Paraguay</option>
          <option value="PE">Peru</option>
          <option value="PH">Philippines</option>
          <option value="PN">Pitcairn</option>
          <option value="PL">Poland</option>
          <option value="PT">Portugal</option>
          <option value="PR">Puerto Rico</option>
          <option value="QA">Qatar</option>
          <option value="RE">Réunion</option>
          <option value="RO">Romania</option>
          <option value="RU">Russian Federation</option>
          <option value="RW">Rwanda</option>
          <option value="BL">Saint Barthélemy</option>
          <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
          <option value="KN">Saint Kitts and Nevis</option>
          <option value="LC">Saint Lucia</option>
          <option value="MF">Saint Martin (French part)</option>
          <option value="PM">Saint Pierre and Miquelon</option>
          <option value="VC">Saint Vincent and the Grenadines</option>
          <option value="WS">Samoa</option>
          <option value="SM">San Marino</option>
          <option value="ST">Sao Tome and Principe</option>
          <option value="SA">Saudi Arabia</option>
          <option value="SN">Senegal</option>
          <option value="RS">Serbia</option>
          <option value="SC">Seychelles</option>
          <option value="SL">Sierra Leone</option>
          <option value="SG">Singapore</option>
          <option value="SX">Sint Maarten (Dutch part)</option>
          <option value="SK">Slovakia</option>
          <option value="SI">Slovenia</option>
          <option value="SB">Solomon Islands</option>
          <option value="SO">Somalia</option>
          <option value="ZA">South Africa</option>
          <option value="GS">South Georgia and the South Sandwich Islands</option>
          <option value="SS">South Sudan</option>
          <option value="ES">Spain</option>
          <option value="LK">Sri Lanka</option>
          <option value="SD">Sudan</option>
          <option value="SR">Suriname</option>
          <option value="SJ">Svalbard and Jan Mayen</option>
          <option value="SE">Sweden</option>
          <option value="CH">Switzerland</option>
          <option value="SY">Syrian Arab Republic</option>
          <option value="TW">Taiwan, Province of China</option>
          <option value="TJ">Tajikistan</option>
          <option value="TZ">Tanzania, United Republic of</option>
          <option value="TH">Thailand</option>
          <option value="TL">Timor-Leste</option>
          <option value="TG">Togo</option>
          <option value="TK">Tokelau</option>
          <option value="TO">Tonga</option>
          <option value="TT">Trinidad and Tobago</option>
          <option value="TN">Tunisia</option>
          <option value="TR">Turkey</option>
          <option value="TM">Turkmenistan</option>
          <option value="TC">Turks and Caicos Islands</option>
          <option value="TV">Tuvalu</option>
          <option value="UG">Uganda</option>
          <option value="UA">Ukraine</option>
          <option value="AE">United Arab Emirates</option>
          <option value="UM">United States Minor Outlying Islands</option>
          <option value="UY">Uruguay</option>
          <option value="UZ">Uzbekistan</option>
          <option value="VU">Vanuatu</option>
          <option value="VE">Venezuela, Bolivarian Republic of</option>
          <option value="VN">Viet Nam</option>
          <option value="VG">Virgin Islands, British</option>
          <option value="VI">Virgin Islands, U.S.</option>
          <option value="WF">Wallis and Futuna</option>
          <option value="EH">Western Sahara</option>
          <option value="YE">Yemen</option>
          <option value="ZM">Zambia</option>
          <option value="ZW">Zimbabwe</option>
        </select>
        
        {/* Customer Name Input (Required) */}
        <div className="mt-3">
          <label htmlFor="customerName" className="block text-[13px] font-[600] mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => handleCustomerInfoChange('customerName', e.target.value)}
            placeholder="Enter your full name for delivery"
            className="w-full px-3 py-2 border border-gray-300 rounded text-[14px]"
            required
          />
          <small className="text-gray-600 text-[12px] mt-1 block">
            Required for delivery. Please enter your full name as it should appear on the package.
          </small>
        </div>

        {/* Apartment/Office Number Input (Optional) */}
        <div className="mt-3">
          <label htmlFor="apartmentNumber" className="block text-[13px] font-[600] mb-2">
            Apartment / Office / Unit Number <span className="text-gray-400 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            id="apartmentNumber"
            value={apartmentNumber}
            onChange={(e) => handleCustomerInfoChange('apartmentNumber', e.target.value)}
            placeholder="e.g., Apt 4B, Suite 200, Unit 15"
            className="w-full px-3 py-2 border border-gray-300 rounded text-[14px]"
          />
          <small className="text-gray-600 text-[12px] mt-1 block">
            If you live in an apartment or work in an office building, please provide the unit number.
          </small>
        </div>

        {/* Phone Number Input with Country Auto-complete */}
        <div className="mt-3">
          <label htmlFor="phone" className="block text-[13px] font-[600] mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            international
            defaultCountry={address.countryCode || 'CA'}
            value={phone}
            onChange={handlePhoneChange}
            onBlur={() => validatePhone(phone)}
            className={`phone-input-wrapper ${phoneError ? 'error' : ''}`}
            placeholder="Enter phone number"
            required
          />
          {phoneError && (
            <span className="text-red-500 text-[12px] mt-1 block">{phoneError}</span>
          )}
          <small className="text-gray-600 text-[12px] mt-1 block">
            Required for shipping. Country code will be auto-detected.
          </small>
        </div>

        {/* Delivery Note Input (Optional) */}
        <div className="mt-3">
          <label htmlFor="deliveryNote" className="block text-[13px] font-[600] mb-2">
            Delivery Instructions <span className="text-gray-400 text-[11px]">(Optional)</span>
          </label>
          <textarea
            id="deliveryNote"
            value={deliveryNote}
            onChange={(e) => handleCustomerInfoChange('deliveryNote', e.target.value)}
            placeholder="e.g., Leave at the door, Ring doorbell twice, Call before delivery..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-[14px] min-h-[70px] resize-y"
            maxLength={500}
          />
          <small className="text-gray-600 text-[12px] mt-1 block">
            Add any special instructions for the delivery driver. Max 500 characters.
          </small>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressInput;


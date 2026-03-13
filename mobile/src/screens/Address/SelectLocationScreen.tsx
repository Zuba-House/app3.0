/**
 * Select Location Screen
 * Auto-detect (IP) or choose country for shipping
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../store/hooks';
import { setShippingLocation } from '../../store/slices/shippingLocationSlice';
import { locationService } from '../../services/location.service';
import Colors from '../../constants/colors';
import { STORAGE_KEYS } from '../../constants/config';

const SelectLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [detecting, setDetecting] = useState(false);
  const [search, setSearch] = useState('');

  const countries = useMemo(() => locationService.getCountryList(), []);
  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.trim().toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const saveAndGoBack = (payload: {
    countryCode: string;
    countryName: string;
    region?: string | null;
    city?: string | null;
  }) => {
    const state = {
      countryCode: payload.countryCode,
      countryName: payload.countryName,
      region: payload.region ?? null,
      city: payload.city ?? null,
    };
    dispatch(setShippingLocation(state));
    AsyncStorage.setItem(STORAGE_KEYS.SHIPPING_LOCATION, JSON.stringify(state)).catch(() => {});
    navigation.goBack();
  };

  const handleUseMyLocation = async () => {
    setDetecting(true);
    try {
      const loc = await locationService.getLocationFromIP();
      if (loc) {
        saveAndGoBack({
          countryCode: loc.countryCode,
          countryName: loc.countryName,
          region: loc.region ?? null,
          city: loc.city ?? null,
        });
      } else {
        // Could show a toast – for now just stop loading
        setDetecting(false);
      }
    } catch {
      setDetecting(false);
    }
  };

  const renderCountry = ({ item }: { item: { code: string; name: string } }) => (
    <TouchableOpacity
      style={styles.countryRow}
      onPress={() =>
        saveAndGoBack({
          countryCode: item.code,
          countryName: item.name,
          region: null,
          city: null,
        })
      }
      activeOpacity={0.7}
    >
      <Text style={styles.countryName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.primary} style={{ opacity: 0.6 }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping location</Text>
        <View style={styles.backBtn} />
      </View>

      <TouchableOpacity
        style={styles.detectRow}
        onPress={handleUseMyLocation}
        disabled={detecting}
        activeOpacity={0.7}
      >
        {detecting ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={Colors.primary} />
        )}
        <Text style={styles.detectText}>
          {detecting ? 'Detecting…' : 'Use my location'}
        </Text>
      </TouchableOpacity>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={Colors.primary} style={{ opacity: 0.6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search country"
          placeholderTextColor={Colors.primary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={renderCountry}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No countries match your search.</Text>
        }
      />
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  detectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detectText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    paddingVertical: 4,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
    marginBottom: 1,
    borderRadius: 6,
  },
  countryName: {
    fontSize: 16,
    color: Colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.7,
  },
});

export default SelectLocationScreen;

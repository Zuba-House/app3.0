import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import {
  AppCurrency,
  DEFAULT_RATES,
  detectCurrency,
  formatPriceWithRates,
  normalizeStoredCurrency,
} from '../utils/currencyDetect';
import { setActiveCurrency, setActiveRates } from '../utils/currencyFormat';

type CurrencyContextValue = {
  currency: AppCurrency;
  setCurrency: (c: AppCurrency) => Promise<void>;
  resetToAutoDetect: () => Promise<void>;
  formatPrice: (priceCAD: number) => string;
  isAutoDetected: boolean;
};

const FALLBACK_CURRENCY: AppCurrency = 'CAD';

const defaultContext: CurrencyContextValue = {
  currency: FALLBACK_CURRENCY,
  setCurrency: async () => {},
  resetToAutoDetect: async () => {},
  formatPrice: (priceCAD) => formatPriceWithRates(priceCAD, FALLBACK_CURRENCY, DEFAULT_RATES),
  isAutoDetected: true,
};

const CurrencyContext = createContext<CurrencyContextValue>(defaultContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detected = useMemo(() => detectCurrency(), []);
  const [currency, setCurrencyState] = useState<AppCurrency>(detected);
  const [rates, setRates] = useState<Record<AppCurrency, number>>({ ...DEFAULT_RATES });
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setActiveCurrency(detected);
    setActiveRates(DEFAULT_RATES);

    const loadPref = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_CURRENCY);
        const normalized = normalizeStoredCurrency(stored);
        if (normalized && mounted.current) {
          setCurrencyState(normalized);
          setActiveCurrency(normalized);
          setIsAutoDetected(false);
        }
      } catch {
        // Keep detected default
      }
    };
    void loadPref();

    const rateTimer = setTimeout(() => {
      void (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch('https://api.exchangerate-api.com/v4/latest/CAD', {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok || !mounted.current) return;
          const data = (await res.json()) as { rates?: Record<string, number> };
          if (!data?.rates) return;
          const next: Record<AppCurrency, number> = {
            CAD: 1,
            USD: Math.round((data.rates.USD ?? DEFAULT_RATES.USD) * 100) / 100,
            EUR: Math.round((data.rates.EUR ?? DEFAULT_RATES.EUR) * 100) / 100,
          };
          setRates(next);
          setActiveRates(next);
        } catch {
          // Keep hardcoded rates
        }
      })();
    }, 2000);

    return () => {
      mounted.current = false;
      clearTimeout(rateTimer);
    };
  }, [detected]);

  const setCurrency = useCallback(async (c: AppCurrency) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_CURRENCY, c);
      if (mounted.current) {
        setCurrencyState(c);
        setActiveCurrency(c);
        setIsAutoDetected(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const resetToAutoDetect = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.APP_CURRENCY);
      const next = detectCurrency();
      if (mounted.current) {
        setCurrencyState(next);
        setActiveCurrency(next);
        setIsAutoDetected(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const formatPrice = useCallback(
    (priceCAD: number) => formatPriceWithRates(priceCAD, currency, rates),
    [currency, rates]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      resetToAutoDetect,
      formatPrice,
      isAutoDetected,
    }),
    [currency, setCurrency, resetToAutoDetect, formatPrice, isAutoDetected]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}

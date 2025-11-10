import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_APPEARANCE = '@flow_appearance';

export type ThemeMode = 'light' | 'dark';
export type ChartType = 'pie' | 'bar';
export type TextSize = 'small' | 'medium' | 'large';

export interface AccentColor {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '#6366F1',
    primaryLight: '#6366F120',
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#3B82F6',
    primaryLight: '#3B82F620',
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#A855F7',
    primaryLight: '#A855F720',
  },
  {
    id: 'pink',
    name: 'Pink',
    primary: '#EC4899',
    primaryLight: '#EC489920',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#F43F5E',
    primaryLight: '#F43F5E20',
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#F97316',
    primaryLight: '#F9731620',
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '#F59E0B',
    primaryLight: '#F59E0B20',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10B981',
    primaryLight: '#10B98120',
  },
  {
    id: 'teal',
    name: 'Teal',
    primary: '#14B8A6',
    primaryLight: '#14B8A620',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    primary: '#06B6D4',
    primaryLight: '#06B6D420',
  },
];

interface AppearanceSettings {
  themeMode: ThemeMode;
  accentColorId: string;
  chartType: ChartType;
  textSize: TextSize;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  themeMode: 'light',
  accentColorId: 'indigo',
  chartType: 'pie',
  textSize: 'medium',
};

export interface Theme {
  mode: ThemeMode;
  accent: AccentColor;
  colors: {
    background: string;
    cardBackground: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    success: string;
    error: string;
    warning: string;
  };
  textScale: number;
}

const getTextScale = (size: TextSize): number => {
  switch (size) {
    case 'small':
      return 0.875;
    case 'medium':
      return 1;
    case 'large':
      return 1.125;
  }
};

const createTheme = (mode: ThemeMode, accentColor: AccentColor, textSize: TextSize): Theme => {
  const isLight = mode === 'light';
  return {
    mode,
    accent: accentColor,
    colors: {
      background: isLight ? '#F8F9FC' : '#0F1419',
      cardBackground: isLight ? '#FFFFFF' : '#1A1F26',
      border: isLight ? '#E5E7EB' : '#2D3748',
      text: {
        primary: isLight ? '#1F2937' : '#F9FAFB',
        secondary: isLight ? '#6B7280' : '#9CA3AF',
        tertiary: isLight ? '#9CA3AF' : '#6B7280',
      },
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    textScale: getTextScale(textSize),
  };
};

export const [AppearanceProvider, useAppearance] = createContextHook(() => {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);

  const appearanceQuery = useQuery({
    queryKey: ['appearance'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_APPEARANCE);
        console.log('Loaded appearance from storage:', stored ? `${stored.length} chars` : 'null');
        
        if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
          console.log('No valid appearance data found, using defaults');
          return DEFAULT_SETTINGS;
        }
        
        const trimmed = stored.trim();
        if (trimmed.startsWith('[object') || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
          console.error('Invalid JSON format detected, resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_APPEARANCE);
          return DEFAULT_SETTINGS;
        }
        
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch (jsonError) {
          console.error('JSON parse failed for appearance:', jsonError);
          console.error('Stored value preview:', trimmed.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_APPEARANCE);
          return DEFAULT_SETTINGS;
        }
        
        if (typeof parsed !== 'object' || parsed === null) {
          console.error('Invalid appearance data format (not an object), resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_APPEARANCE);
          return DEFAULT_SETTINGS;
        }
        
        console.log('Successfully loaded appearance settings');
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (error) {
        console.error('Error loading appearance settings:', error);
        console.error('This usually means corrupted data in AsyncStorage');
        await AsyncStorage.removeItem(STORAGE_KEY_APPEARANCE);
        return DEFAULT_SETTINGS;
      }
    },
  });

  useEffect(() => {
    if (appearanceQuery.data) {
      setSettings(appearanceQuery.data);
    }
  }, [appearanceQuery.data]);

  const updateSettings = useCallback(async (updates: Partial<AppearanceSettings>) => {
    setSettings((prevSettings) => {
      const updated = { ...prevSettings, ...updates };
      AsyncStorage.setItem(STORAGE_KEY_APPEARANCE, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save appearance settings:', err)
      );
      return updated;
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    updateSettings({ themeMode: mode });
  }, [updateSettings]);

  const setAccentColor = useCallback((colorId: string) => {
    updateSettings({ accentColorId: colorId });
  }, [updateSettings]);

  const setChartType = useCallback((type: ChartType) => {
    updateSettings({ chartType: type });
  }, [updateSettings]);

  const setTextSize = useCallback((size: TextSize) => {
    updateSettings({ textSize: size });
  }, [updateSettings]);

  const accentColor = ACCENT_COLORS.find((c) => c.id === settings.accentColorId) || ACCENT_COLORS[0];
  const theme = createTheme(settings.themeMode, accentColor, settings.textSize);

  return {
    settings,
    theme,
    themeMode: settings.themeMode,
    accentColor,
    chartType: settings.chartType,
    textSize: settings.textSize,
    setThemeMode,
    setAccentColor,
    setChartType,
    setTextSize,
    isLoading: appearanceQuery.isLoading,
  };
});

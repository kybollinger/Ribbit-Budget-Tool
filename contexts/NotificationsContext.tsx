import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY_NOTIFICATIONS = '@ribbit_notifications';

interface NotificationSettings {
  enabled: boolean;
  motivationsEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  motivationsEnabled: true,
};

const MOTIVATIONAL_MESSAGES = [
  "Time to track your spending! 🐸",
  "Ribbit! Don't forget to log your expenses today! 💰",
  "Keep your budget on track - add today's transactions! 📊",
  "Your future self will thank you for tracking today! ✨",
  "Ribbit ribbit! Let's update your expenses! 🌟",
  "Stay on top of your finances! Add your transactions! 💪",
  "A few minutes now = financial clarity later! 🎯",
  "Hop to it! Time to log your daily expenses! 🐸💚",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        console.log('Loaded notifications settings from storage:', stored ? `${stored.length} chars` : 'null');
        
        if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
          console.log('No notification settings found, using defaults');
          return DEFAULT_SETTINGS;
        }
        
        const trimmed = stored.trim();
        if (trimmed.startsWith('[object') || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
          console.error('Invalid JSON format detected (looks like [object Object]), resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
          return DEFAULT_SETTINGS;
        }
        
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch (jsonError) {
          console.error('JSON parse failed for notifications:', jsonError);
          console.error('Stored value preview:', trimmed.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
          return DEFAULT_SETTINGS;
        }
        
        if (typeof parsed !== 'object' || parsed === null) {
          console.error('Invalid notification data format, resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
          return DEFAULT_SETTINGS;
        }
        
        console.log('Successfully loaded notification settings');
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (error) {
        console.error('Error loading notification settings:', error);
        console.error('This usually means corrupted data in AsyncStorage');
        await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
        return DEFAULT_SETTINGS;
      }
    },
  });

  useEffect(() => {
    if (notificationsQuery.data) {
      setSettings(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission for notifications not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const scheduleDailyNotification = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const randomHour = Math.floor(Math.random() * 12) + 9;
      const randomMinute = Math.floor(Math.random() * 60);

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(randomHour, randomMinute, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const message = settings.motivationsEnabled
        ? MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
        : "Don't forget to log your expenses today!";

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ribbit Budget Reminder',
          body: message,
          sound: true,
        },
        trigger: {
          date: scheduledTime,
          repeats: true,
        },
      });

      console.log(`Scheduled daily notification for ${randomHour}:${randomMinute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }, [settings.motivationsEnabled]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      const updated = { ...settings, ...updates };
      const stringified = JSON.stringify(updated);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize notification settings');
      }
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, stringified);
      return updated;
    },
    onSuccess: (updated) => {
      setSettings(updated);
      if (updated.enabled) {
        scheduleDailyNotification();
      } else {
        if (Platform.OS !== 'web') {
          Notifications.cancelAllScheduledNotificationsAsync();
        }
      }
    },
  });

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (enabled && Platform.OS !== 'web') {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return;
      }
    }
    updateSettingsMutation.mutate({ enabled });
  }, [requestPermissions, updateSettingsMutation]);

  const setMotivationsEnabled = useCallback((motivationsEnabled: boolean) => {
    updateSettingsMutation.mutate({ motivationsEnabled });
  }, [updateSettingsMutation]);

  useEffect(() => {
    if (settings.enabled && Platform.OS !== 'web') {
      requestPermissions().then((hasPermission) => {
        if (hasPermission) {
          scheduleDailyNotification();
        }
      });
    }
  }, [settings.enabled, requestPermissions, scheduleDailyNotification]);

  return {
    settings,
    enabled: settings.enabled,
    motivationsEnabled: settings.motivationsEnabled,
    setEnabled,
    setMotivationsEnabled,
    requestPermissions,
    isLoading: notificationsQuery.isLoading,
  };
});

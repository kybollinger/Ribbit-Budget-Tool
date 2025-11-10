import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  RefreshCw,
  FolderOpen,
  Palette,
  Bell,
  Info,
  ChevronRight,
} from 'lucide-react-native';

import { useAppearance } from '@/contexts/AppearanceContext';
import { useBudget } from '@/contexts/BudgetContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { transactions } = useBudget();

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      `This will delete:\n• ${transactions.length} transaction(s)\n• All custom categories\n\nThis action cannot be undone. Are you sure?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@flow_transactions');
              await AsyncStorage.removeItem('@flow_categories');
              await AsyncStorage.removeItem('@flow_recurring_payments');
              Alert.alert('Success', 'All data has been cleared. Please restart the app.', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
              console.error('Error clearing data:', error);
            }
          },
        },
      ]
    );
  };



  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Account',
          description: 'Sign up, log in, or manage your account',
          onPress: () => {
            Alert.alert(
              'Account Feature',
              'Account management requires backend support. Please enable backend in the project settings to use this feature.',
              [{ text: 'OK' }]
            );
          },
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: RefreshCw,
          label: 'Recurring Transactions',
          description: 'Manage automatic recurring income or expenses',
          onPress: () => {
            router.push('/recurring-payments');
          },
        },
        {
          icon: FolderOpen,
          label: 'Categories',
          description: 'Manage spending categories and set goals',
          onPress: () => {
            router.push('/categories-management');
          },
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Palette,
          label: 'Appearance & Display',
          description: 'Customize the look and feel',
          onPress: () => {
            router.push('/appearance-settings');
          },
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Daily reminders and motivations',
          onPress: () => {
            router.push('/notifications-settings');
          },
        },
      ],
    },

    {
      title: 'Danger Zone',
      items: [
        {
          icon: RefreshCw,
          label: 'Clear All Data',
          description: 'Delete all transactions and custom categories',
          onPress: handleClearAllData,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'About & Support',
          description: 'App info and support resources',
          onPress: () => {
            Alert.alert(
              'Ribbit Budget Tracker',
              'Version 1.0.0\n\nTrack every dollar with ease. Ribbit helps you manage your finances, set goals, and understand your spending patterns.\n\nFor support, please contact: support@ribbitapp.com',
              [{ text: 'OK' }]
            );
          },
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: 36 * theme.textScale, color: theme.colors.text.primary }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>Customize your app experience</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>{section.title}</Text>
            <View style={[styles.settingsGroup, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      { borderBottomColor: theme.colors.border },
                      itemIndex === section.items.length - 1 && styles.settingItemLast,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.settingIconContainer, { backgroundColor: theme.accent.primaryLight }]}>
                      <IconComponent size={24} color={theme.accent.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingLabel, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>{item.label}</Text>
                      <Text style={[styles.settingDescription, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>{item.description}</Text>
                    </View>
                    <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
    lineHeight: 18,
  },
});

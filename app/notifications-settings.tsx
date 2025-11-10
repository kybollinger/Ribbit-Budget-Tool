import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MessageSquare, ChevronLeft } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { enabled, motivationsEnabled, setEnabled, setMotivationsEnabled } = useNotifications();

  const handleToggleNotifications = async (value: boolean) => {
    await setEnabled(value);
  };

  const handleToggleMotivations = (value: boolean) => {
    setMotivationsEnabled(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerStyle: {
            backgroundColor: theme.colors.cardBackground,
          },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={theme.colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.accent.primaryLight }]}>
            <Bell size={32} color={theme.accent.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { fontSize: 24 * theme.textScale, color: theme.colors.text.primary }]}>
            Daily Reminders
          </Text>
          <Text style={[styles.description, { fontSize: 15 * theme.textScale, color: theme.colors.text.secondary }]}>
            Ribbit will send you a daily reminder at a random time to help you stay on track with logging your expenses. Never miss a day of budgeting! 🐸
          </Text>
        </View>

        {Platform.OS === 'web' && (
          <View style={[styles.warningCard, { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning }]}>
            <Text style={[styles.warningText, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]}>
              Notifications are not supported on web. Please use the mobile app to enable reminders.
            </Text>
          </View>
        )}

        <View style={[styles.settingsCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>
                Daily Reminders
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>
                Get notified once per day at a random time
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.colors.border, true: theme.accent.primary }}
              thumbColor="#FFFFFF"
              disabled={Platform.OS === 'web'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={[styles.settingRow, { opacity: enabled ? 1 : 0.5 }]}>
            <View style={styles.settingInfo}>
              <View style={styles.motivationHeader}>
                <MessageSquare size={18} color={theme.accent.primary} strokeWidth={2} />
                <Text style={[styles.settingLabel, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary, marginLeft: 8 }]}>
                  Motivational Messages
                </Text>
              </View>
              <Text style={[styles.settingDescription, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>
                Include fun and encouraging messages with your reminders
              </Text>
            </View>
            <Switch
              value={motivationsEnabled}
              onValueChange={handleToggleMotivations}
              trackColor={{ false: theme.colors.border, true: theme.accent.primary }}
              thumbColor="#FFFFFF"
              disabled={!enabled || Platform.OS === 'web'}
            />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.accent.primaryLight, borderColor: theme.accent.primary + '30' }]}>
          <Text style={[styles.infoTitle, { fontSize: 15 * theme.textScale, color: theme.colors.text.primary }]}>
            Why Daily Reminders?
          </Text>
          <Text style={[styles.infoText, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
            Consistent tracking is the key to successful budgeting. Daily reminders help you build a habit of logging expenses, ensuring you never lose track of where your money goes.
          </Text>
          <Text style={[styles.infoText, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary, marginTop: 12 }]}>
            Notifications are sent at random times between 9 AM and 9 PM to catch you when it's most convenient.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, Moon, Sun, BarChart3, PieChart as PieChartIcon } from 'lucide-react-native';
import { useAppearance, ACCENT_COLORS } from '@/contexts/AppearanceContext';

export default function AppearanceSettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    themeMode,
    accentColor,
    chartType,
    setThemeMode,
    setAccentColor,
    setChartType,
  } = useAppearance();

  const isDark = themeMode === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: theme.accent.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Appearance</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          Customize the look and feel
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Theme Mode</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.themeToggle}>
              <View style={styles.themeOption}>
                <Sun size={24} color={!isDark ? theme.accent.primary : theme.colors.text.tertiary} strokeWidth={2} />
                <Text style={[styles.themeOptionText, { color: !isDark ? theme.colors.text.primary : theme.colors.text.secondary }]}>
                  Light
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: '#E5E7EB', true: theme.accent.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
              <View style={styles.themeOption}>
                <Moon size={24} color={isDark ? theme.accent.primary : theme.colors.text.tertiary} strokeWidth={2} />
                <Text style={[styles.themeOptionText, { color: isDark ? theme.colors.text.primary : theme.colors.text.secondary }]}>
                  Dark
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Accent Color</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.colorGrid}>
              {ACCENT_COLORS.map((color) => {
                const isSelected = color.id === accentColor.id;
                return (
                  <TouchableOpacity
                    key={color.id}
                    style={[
                      styles.colorOption,
                      { borderColor: isSelected ? color.primary : theme.colors.border },
                      isSelected && styles.colorOptionSelected,
                    ]}
                    onPress={() => setAccentColor(color.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color.primary }]}>
                      {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <Text style={[styles.colorName, { color: theme.colors.text.secondary }]}>
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            Analysis Chart Type
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <TouchableOpacity
              style={[
                styles.optionRow,
                styles.optionRowFirst,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={() => setChartType('pie')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <PieChartIcon size={22} color={theme.colors.text.secondary} strokeWidth={2} />
                <View>
                  <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>Pie Chart</Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.text.tertiary }]}>
                    Visual percentage breakdown
                  </Text>
                </View>
              </View>
              {chartType === 'pie' && (
                <Check size={20} color={theme.accent.primary} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowLast]}
              onPress={() => setChartType('bar')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <BarChart3 size={22} color={theme.colors.text.secondary} strokeWidth={2} />
                <View>
                  <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>Bar Chart</Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.text.tertiary }]}>
                    Compare spending amounts
                  </Text>
                </View>
              </View>
              {chartType === 'bar' && (
                <Check size={20} color={theme.accent.primary} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
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
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  colorOption: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  colorOptionSelected: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionRowFirst: {
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
});

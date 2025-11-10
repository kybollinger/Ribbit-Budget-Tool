import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNotes(user.financeGoalNotes || '');
      setGoals(user.financeGoals || []);
    }
  }, [user]);

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
      return;
    }
    
    const filteredGoals = goals.filter(g => g.trim() !== '');
    
    updateProfile({ 
      name: name.trim(),
      financeGoalNotes: notes.trim(),
      financeGoals: filteredGoals
    });
    
    router.back();
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>
          Edit Profile
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                fontSize: 16 * theme.textScale,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.text.secondary}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
              Personal Finance Goals
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.accent.primary }]}
              onPress={addGoal}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { fontSize: 12 * theme.textScale, color: theme.colors.text.tertiary }]}>
            Add specific goals to help you stay focused on your financial objectives
          </Text>
          {goals.map((goal, index) => (
            <View key={index} style={styles.goalInputContainer}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalNumber, { fontSize: 13 * theme.textScale, color: theme.colors.text.tertiary }]}>
                  Goal {index + 1}
                </Text>
                {goals.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeGoal(index)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[
                  styles.goalInput,
                  {
                    fontSize: 16 * theme.textScale,
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={goal}
                onChangeText={(value) => updateGoal(index, value)}
                placeholder="e.g., Save $10,000 for emergency fund"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
            </View>
          ))}
          {goals.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <Text style={[styles.emptyStateText, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                No goals added yet. Tap the + button to add your first goal!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20, backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.accent.primary }]}
          onPress={handleSave}
          disabled={isUpdatingProfile}
          activeOpacity={0.8}
        >
          {isUpdatingProfile ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.saveButtonText, { fontSize: 16 * theme.textScale }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInputContainer: {
    gap: 8,
    marginTop: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalNumber: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  deleteButton: {
    padding: 4,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    minHeight: 80,
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    minHeight: 150,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});

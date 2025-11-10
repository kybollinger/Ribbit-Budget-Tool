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
import { ArrowLeft } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNotes(user.financeGoalNotes || '');
    }
  }, [user]);

  const handleSave = () => {
    if (name.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
      return;
    }
    
    updateProfile({ 
      name: name.trim(),
      financeGoalNotes: notes.trim() 
    });
    
    router.back();
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
          <Text style={[styles.label, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
            Personal Finance Goals
          </Text>
          <Text style={[styles.helperText, { fontSize: 12 * theme.textScale, color: theme.colors.text.tertiary }]}>
            Add notes to help you stay focused on your financial objectives
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                fontSize: 16 * theme.textScale,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.border,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Save $10,000 for emergency fund, Pay off credit card debt by end of year..."
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={[styles.characterCount, { fontSize: 12 * theme.textScale, color: theme.colors.text.tertiary }]}>
            {notes.length}/1000
          </Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
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

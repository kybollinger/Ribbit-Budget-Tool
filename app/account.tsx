import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, User, LogOut, Chrome, Apple as AppleIcon, Camera, Edit3 } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { STREAK_WIZARD_FROG } from '@/constants/mascots';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { user, isAuthenticated, signInWithGoogle, signInWithApple, signOut, updateProfile, isSigningIn, isSigningOut, isUpdatingProfile } = useAuth();
  const [signingInWith, setSigningInWith] = useState<'google' | 'apple' | null>(null);

  const frogMascot = STREAK_WIZARD_FROG;


  const handleGoogleSignIn = async () => {
    try {
      setSigningInWith('google');
      
      if (Platform.OS === 'web') {
        Alert.alert(
          'Demo Mode',
          'Google Sign-In would open here on a real app. For demo purposes, we\'ll create a mock account.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setSigningInWith(null) },
            {
              text: 'Continue',
              onPress: () => {
                signInWithGoogle({
                  email: 'demo@gmail.com',
                  name: 'Demo User',
                  picture: undefined,
                });
                setSigningInWith(null);
              },
            },
          ]
        );
      } else {
        signInWithGoogle({
          email: 'demo@gmail.com',
          name: 'Demo User',
          picture: undefined,
        });
        setSigningInWith(null);
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      setSigningInWith(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setSigningInWith('apple');
      
      if (Platform.OS !== 'ios') {
        Alert.alert(
          'Demo Mode',
          'Apple Sign-In would open here on iOS. For demo purposes, we\'ll create a mock account.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setSigningInWith(null) },
            {
              text: 'Continue',
              onPress: () => {
                signInWithApple({
                  email: 'demo@icloud.com',
                  fullName: { givenName: 'Demo', familyName: 'User' },
                });
                setSigningInWith(null);
              },
            },
          ]
        );
      } else {
        signInWithApple({
          email: 'demo@icloud.com',
          fullName: { givenName: 'Demo', familyName: 'User' },
        });
        setSigningInWith(null);
      }
    } catch (error) {
      console.error('Apple sign-in failed:', error);
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
      setSigningInWith(null);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleEditProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        updateProfile({ profilePicture: imageUri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
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
          Account
        </Text>
        {isAuthenticated && user ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.7}
          >
            <Edit3 size={20} color={theme.accent.primary} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {isAuthenticated && user ? (
          <View style={styles.authenticatedContainer}>
            <View style={[styles.profileCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.accent.primaryLight }]}>
                  {user.profilePicture && user.profilePicture.trim() !== '' ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <User size={40} color={theme.accent.primary} strokeWidth={2} />
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.editAvatarButton, { backgroundColor: theme.accent.primary }]}
                  onPress={handleEditProfilePicture}
                  disabled={isUpdatingProfile}
                  activeOpacity={0.8}
                >
                  {isUpdatingProfile ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Camera size={16} color="#fff" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { fontSize: 24 * theme.textScale, color: theme.colors.text.primary }]}>
                  {user.name}
                </Text>
                <Text style={[styles.userEmail, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>
                  {user.email}
                </Text>
                <View style={[styles.providerBadge, { backgroundColor: user.provider === 'google' ? '#4285F4' : '#000' }]}>
                  {user.provider === 'google' ? (
                    <Chrome size={14} color="#fff" strokeWidth={2} />
                  ) : (
                    <AppleIcon size={14} color="#fff" strokeWidth={2} />
                  )}
                  <Text style={[styles.providerText, { fontSize: 12 * theme.textScale }]}>
                    Signed in with {user.provider === 'google' ? 'Google' : 'Apple'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.streakCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <View style={styles.streakContent}>
                <View style={styles.streakInfo}>
                  <Text style={[styles.streakTitle, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                    Daily Streak
                  </Text>
                  <Text style={[styles.streakDays, { fontSize: 32 * theme.textScale, color: theme.accent.primary }]}>
                    {user.streakData?.currentStreak || 0}
                  </Text>
                  <Text style={[styles.streakLabel, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                    {(user.streakData?.currentStreak || 0) === 1 ? 'day' : 'days'} in a row!
                  </Text>
                  {(user.streakData?.longestStreak || 0) > 1 && (
                    <Text style={[styles.streakBest, { fontSize: 13 * theme.textScale, color: theme.colors.text.tertiary }]}>
                      Best: {user.streakData?.longestStreak} days
                    </Text>
                  )}
                </View>
                <View style={styles.frogContainer}>
                  {frogMascot?.uri && frogMascot.uri.trim() !== '' && (
                    <Image
                      source={{ uri: frogMascot.uri }}
                      style={styles.frogImage}
                      contentFit="contain"
                      tintColor={theme.accent.primary}
                    />
                  )}
                </View>
              </View>
            </View>

            {user.financeGoals && user.financeGoals.length > 0 && (
              <View style={[styles.goalsCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <Text style={[styles.goalsTitle, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                  Personal Finance Goals
                </Text>
                <View style={styles.goalsContainer}>
                  {user.financeGoals.map((goal, index) => (
                    <View key={index} style={styles.goalItem}>
                      <Text style={[styles.goalLabel, { fontSize: 14 * theme.textScale, color: theme.colors.text.tertiary }]}>
                        Goal {index + 1}
                      </Text>
                      <Text style={[styles.goalsText, { fontSize: 15 * theme.textScale, color: theme.colors.text.secondary }]}>
                        {goal}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.signOutButton, { backgroundColor: theme.colors.cardBackground, borderColor: '#EF4444' }]}
              onPress={handleSignOut}
              disabled={isSigningOut}
              activeOpacity={0.7}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <LogOut size={20} color="#EF4444" strokeWidth={2} />
                  <Text style={[styles.signOutText, { fontSize: 16 * theme.textScale }]}>Sign Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.unauthenticatedContainer}>
            <View style={[styles.welcomeCard, { backgroundColor: theme.accent.primaryLight }]}>
              <User size={60} color={theme.accent.primary} strokeWidth={2} />
              <Text style={[styles.welcomeTitle, { fontSize: 28 * theme.textScale, color: theme.colors.text.primary }]}>
                Welcome to Ribbit
              </Text>
              <Text style={[styles.welcomeDescription, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>
                Create an account to sync your budget across all your devices and never lose your data
              </Text>
            </View>

            <View style={styles.signInOptions}>
              <Text style={[styles.signInTitle, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                Create an Account
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  styles.googleButton,
                  signingInWith === 'google' && styles.signInButtonDisabled,
                ]}
                onPress={handleGoogleSignIn}
                disabled={isSigningIn}
                activeOpacity={0.8}
              >
                {signingInWith === 'google' ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Chrome size={24} color="#4285F4" strokeWidth={2} />
                    </View>
                    <Text style={[styles.signInButtonText, { fontSize: 16 * theme.textScale }]}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.signInButton,
                  styles.appleButton,
                  signingInWith === 'apple' && styles.signInButtonDisabled,
                ]}
                onPress={handleAppleSignIn}
                disabled={isSigningIn}
                activeOpacity={0.8}
              >
                {signingInWith === 'apple' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AppleIcon size={24} color="#fff" strokeWidth={2} />
                    <Text style={[styles.signInButtonTextWhite, { fontSize: 16 * theme.textScale }]}>
                      Continue with Apple
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.disclaimerCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <Text style={[styles.disclaimerText, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>
                By creating an account, you agree to our Terms of Service and Privacy Policy. Your financial data will be encrypted and stored securely.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  editButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  authenticatedContainer: {
    gap: 20,
  },
  profileCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  streakCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  streakInfo: {
    flex: 1,
    gap: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  streakDays: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  streakBest: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  frogContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frogImage: {
    width: '100%',
    height: '100%',
  },
  goalsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  goalsContainer: {
    gap: 20,
  },
  goalItem: {
    gap: 6,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  goalsText: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  unauthenticatedContainer: {
    gap: 32,
  },
  welcomeCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 24,
  },
  signInOptions: {
    gap: 16,
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    minHeight: 56,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  signInButtonTextWhite: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  disclaimerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 20,
  },
});

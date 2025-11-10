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
import { ArrowLeft, User, LogOut, Chrome, Apple as AppleIcon } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { user, isAuthenticated, signInWithGoogle, signInWithApple, signOut, isSigningIn, isSigningOut } = useAuth();
  const [signingInWith, setSigningInWith] = useState<'google' | 'apple' | null>(null);

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
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {isAuthenticated && user ? (
          <View style={styles.authenticatedContainer}>
            <View style={[styles.profileCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.accent.primaryLight }]}>
                <User size={40} color={theme.accent.primary} strokeWidth={2} />
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
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

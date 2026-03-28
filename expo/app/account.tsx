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
  TextInput,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, User, LogOut, Chrome, Apple as AppleIcon, Camera, Edit3, Mail, Landmark, XCircle } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBankConnection } from '@/contexts/BankConnectionContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { STREAK_WIZARD_FROG } from '@/constants/mascots';
import PlaidLink from '@/components/PlaidLink';
import { trpc } from '@/lib/trpc';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { user, isAuthenticated, signInWithGoogle, signInWithApple, signUpWithEmail, signOut, updateProfile, isSigningIn, isSigningOut, isUpdatingProfile } = useAuth();
  const { connection, isConnected, saveBankConnection, removeBankConnection, isSaving, isRemoving } = useBankConnection();
  const [signingInWith, setSigningInWith] = useState<'google' | 'apple' | 'email' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [automaticMode, setAutomaticMode] = useState(false);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [linkToken, setLinkToken] = useState('');

  const createLinkTokenMutation = trpc.plaid.createLinkToken.useMutation();
  const exchangeTokenMutation = trpc.plaid.exchangeToken.useMutation();

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

  const handleEmailSignUp = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setSigningInWith('email');
    signUpWithEmail({ name: name.trim(), email: email.trim().toLowerCase() });
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

  const handleConnectBank = async () => {
    if (!user) return;
    
    try {
      const result = await createLinkTokenMutation.mutateAsync({
        userId: user.id,
      });
      
      setLinkToken(result.linkToken);
      setShowPlaidModal(true);
    } catch (error) {
      console.error('Error creating link token:', error);
      Alert.alert('Error', 'Failed to initialize bank connection. Please try again.');
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    if (!user) return;
    
    try {
      const result = await exchangeTokenMutation.mutateAsync({
        publicToken,
        userId: user.id,
        institutionName: metadata.institution?.name,
        accountId: metadata.accounts?.[0]?.id,
      });
      
      saveBankConnection({
        accessToken: result.accessToken,
        itemId: result.itemId,
        institutionName: metadata.institution?.name || result.institutionName,
        institutionId: metadata.institution?.institution_id || '',
        accounts: metadata.accounts || [],
      });
      
      Alert.alert('Success!', `Your ${result.institutionName} account has been connected.`);
    } catch (error) {
      console.error('Error exchanging token:', error);
      Alert.alert('Error', 'Failed to complete bank connection. Please try again.');
    }
  };

  const handleDisconnectBank = () => {
    Alert.alert(
      'Disconnect Bank',
      'Are you sure you want to disconnect your bank account? This will stop automatic transaction syncing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            removeBankConnection();
            setAutomaticMode(false);
          },
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
                <View style={[styles.providerBadge, { backgroundColor: user.provider === 'google' ? '#4285F4' : user.provider === 'apple' ? '#000' : theme.accent.primary }]}>
                  {user.provider === 'google' ? (
                    <Chrome size={14} color="#fff" strokeWidth={2} />
                  ) : user.provider === 'apple' ? (
                    <AppleIcon size={14} color="#fff" strokeWidth={2} />
                  ) : (
                    <Mail size={14} color="#fff" strokeWidth={2} />
                  )}
                  <Text style={[styles.providerText, { fontSize: 12 * theme.textScale }]}>
                    Signed in with {user.provider === 'google' ? 'Google' : user.provider === 'apple' ? 'Apple' : 'Email'}
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

            <View style={[styles.automaticModeCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <View style={styles.automaticModeHeader}>
                <View style={styles.automaticModeInfo}>
                  <Text style={[styles.automaticModeTitle, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                    Automatic Mode
                  </Text>
                  <Text style={[styles.automaticModeDescription, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                    Sync transactions from your bank automatically
                  </Text>
                </View>
                <Switch
                  value={automaticMode}
                  onValueChange={(value) => {
                    setAutomaticMode(value);
                    if (!value && isConnected) {
                      handleDisconnectBank();
                    }
                  }}
                  trackColor={{ false: theme.colors.border, true: theme.accent.primary }}
                  thumbColor="#fff"
                  ios_backgroundColor={theme.colors.border}
                />
              </View>

              {automaticMode && !isConnected && (
                <TouchableOpacity
                  style={[styles.connectBankButton, { backgroundColor: theme.accent.primary }]}
                  onPress={handleConnectBank}
                  activeOpacity={0.8}
                  disabled={createLinkTokenMutation.isPending}
                >
                  {createLinkTokenMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Landmark size={20} color="#fff" strokeWidth={2} />
                      <Text style={[styles.connectBankText, { fontSize: 16 * theme.textScale }]}>
                        Connect Bank Account
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {automaticMode && isConnected && connection && (
                <View style={styles.connectedBankInfo}>
                  <View style={[styles.connectedBankCard, { backgroundColor: theme.accent.primaryLight }]}>
                    <View style={styles.connectedBankHeader}>
                      <View style={styles.connectedBankDetails}>
                        <Landmark size={24} color={theme.accent.primary} strokeWidth={2} />
                        <View style={styles.connectedBankText}>
                          <Text style={[styles.connectedBankName, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>
                            {connection.accounts[0]?.institutionName || 'Bank Account'}
                          </Text>
                          <Text style={[styles.connectedBankAccount, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                            {connection.accounts[0]?.accountName || ''} {connection.accounts[0]?.accountMask ? `••${connection.accounts[0].accountMask}` : ''}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={handleDisconnectBank}
                        disabled={isRemoving}
                        activeOpacity={0.7}
                      >
                        {isRemoving ? (
                          <ActivityIndicator size="small" color={theme.colors.text.tertiary} />
                        ) : (
                          <XCircle size={24} color={theme.colors.text.tertiary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.syncedText, { fontSize: 13 * theme.textScale, color: theme.colors.text.tertiary }]}>
                    Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <PlaidLink
              visible={showPlaidModal}
              onClose={() => setShowPlaidModal(false)}
              onSuccess={handlePlaidSuccess}
              onExit={() => setShowPlaidModal(false)}
              linkToken={linkToken}
            />

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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
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
              
              <View style={[styles.emailSignUpForm, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <TextInput
                  style={[styles.input, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                  placeholder="Your name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isSigningIn}
                />
                <TextInput
                  style={[styles.input, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isSigningIn}
                />
                <TouchableOpacity
                  style={[styles.emailSignUpButton, { backgroundColor: theme.accent.primary }]}
                  onPress={handleEmailSignUp}
                  disabled={isSigningIn}
                  activeOpacity={0.8}
                >
                  {signingInWith === 'email' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Mail size={20} color="#fff" strokeWidth={2} />
                      <Text style={[styles.emailSignUpButtonText, { fontSize: 16 * theme.textScale }]}>
                        Create Account
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerText, { fontSize: 14 * theme.textScale, color: theme.colors.text.tertiary }]}>
                  or continue with
                </Text>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              </View>
              
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
          </KeyboardAvoidingView>
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
  emailSignUpForm: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  emailSignUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 12,
    marginTop: 4,
  },
  emailSignUpButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  automaticModeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  automaticModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  automaticModeInfo: {
    flex: 1,
    gap: 4,
  },
  automaticModeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  automaticModeDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  connectBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  connectBankText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  connectedBankInfo: {
    gap: 8,
  },
  connectedBankCard: {
    padding: 16,
    borderRadius: 12,
  },
  connectedBankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectedBankDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  connectedBankText: {
    gap: 4,
    flex: 1,
  },
  connectedBankName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  connectedBankAccount: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  syncedText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});

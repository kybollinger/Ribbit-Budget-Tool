import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const STORAGE_KEY_AUTH = '@flow_auth';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
  profilePicture?: string;
  financeGoalNotes?: string;
  financeGoals?: string[];
  streakData?: {
    currentStreak: number;
    lastTransactionDate?: string;
    longestStreak: number;
  };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        console.log('Loaded auth from storage:', stored ? 'found' : 'null');
        
        if (!stored || stored === 'null' || stored === 'undefined') {
          return null;
        }
        
        if (stored.startsWith('[object')) {
          console.error('Invalid data format detected:', stored);
          await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
          return null;
        }
        
        const parsed = JSON.parse(stored);
        return parsed as User;
      } catch (error) {
        console.error('Error loading auth:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
        return null;
      }
    },
  });

  useEffect(() => {
    if (authQuery.data !== undefined) {
      setUser(authQuery.data);
    }
  }, [authQuery.data]);

  const signInWithGoogleMutation = useMutation({
    mutationFn: async (credential: any) => {
      const mockUser: User = {
        id: Date.now().toString(),
        email: credential.email || 'user@gmail.com',
        name: credential.name || 'Google User',
        provider: 'google',
        profilePicture: credential.picture,
      };
      
      const stringified = JSON.stringify(mockUser);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize user data');
      }
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Signed in with Google:', data);
    },
    onError: (error) => {
      console.error('Google sign-in error:', error);
    },
  });

  const signInWithAppleMutation = useMutation({
    mutationFn: async (credential: any) => {
      const mockUser: User = {
        id: Date.now().toString(),
        email: credential.email || 'user@icloud.com',
        name: credential.fullName?.givenName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : 'Apple User',
        provider: 'apple',
      };
      
      const stringified = JSON.stringify(mockUser);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize user data');
      }
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Signed in with Apple:', data);
    },
    onError: (error) => {
      console.error('Apple sign-in error:', error);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    },
    onSuccess: () => {
      setUser(null);
      console.log('Signed out successfully');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, profilePicture, financeGoalNotes, financeGoals, streakData }: { name?: string; profilePicture?: string; financeGoalNotes?: string; financeGoals?: string[]; streakData?: User['streakData'] }) => {
      if (!user) throw new Error('No user to update');
      
      const updates: Partial<User> = {};
      if (name !== undefined) updates.name = name;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      if (financeGoalNotes !== undefined) updates.financeGoalNotes = financeGoalNotes;
      if (financeGoals !== undefined) updates.financeGoals = financeGoals;
      if (streakData !== undefined) updates.streakData = streakData;
      
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      console.log('Attempting to save user:', updatedUser);
      
      const stringified = JSON.stringify(updatedUser);
      console.log('Stringified user data:', stringified.substring(0, 100));
      
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        console.error('Invalid stringified data:', stringified);
        throw new Error('Failed to serialize user data');
      }
      
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
      console.log('User data saved successfully');
      return updatedUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Profile updated:', data);
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    },
  });

  const updateStreak = (transactionDate: string) => {
    if (!user) return { isNewStreak: false, currentStreak: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const txDate = new Date(transactionDate);
    txDate.setHours(0, 0, 0, 0);

    const currentStreakData = user.streakData || {
      currentStreak: 0,
      longestStreak: 0,
    };

    const lastDate = currentStreakData.lastTransactionDate
      ? new Date(currentStreakData.lastTransactionDate)
      : null;
    
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    if (lastDate && lastDate.getTime() === today.getTime()) {
      return { isNewStreak: false, currentStreak: currentStreakData.currentStreak };
    }

    let newStreak = currentStreakData.currentStreak;
    let isNewStreak = false;

    if (!lastDate) {
      newStreak = 1;
      isNewStreak = true;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = currentStreakData.currentStreak + 1;
        isNewStreak = true;
      } else if (txDate.getTime() === today.getTime()) {
        newStreak = 1;
        isNewStreak = true;
      } else {
        newStreak = 1;
        isNewStreak = false;
      }
    }

    const longestStreak = Math.max(newStreak, currentStreakData.longestStreak);

    const newStreakData = {
      currentStreak: newStreak,
      lastTransactionDate: today.toISOString(),
      longestStreak,
    };

    updateProfileMutation.mutate({ streakData: newStreakData });

    return { isNewStreak, currentStreak: newStreak };
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: authQuery.isLoading,
    signInWithGoogle: signInWithGoogleMutation.mutate,
    signInWithApple: signInWithAppleMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updateStreak,
    isSigningIn: signInWithGoogleMutation.isPending || signInWithAppleMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
});

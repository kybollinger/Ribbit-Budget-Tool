import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY_BANK = '@flow_bank_connection';

interface BankAccount {
  id: string;
  institutionName: string;
  institutionId: string;
  accountName: string;
  accountMask: string;
  accountType: string;
  balance?: number;
  connectedAt: string;
}

interface BankConnection {
  userId: string;
  accessToken: string;
  itemId: string;
  accounts: BankAccount[];
  connectedAt: string;
}

export const [BankConnectionProvider, useBankConnection] = createContextHook(() => {
  const { user } = useAuth();
  const [connection, setConnection] = useState<BankConnection | null>(null);

  const bankQuery = useQuery({
    queryKey: ['bank-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_BANK);
        if (!stored || stored === 'null' || stored === 'undefined') {
          return null;
        }
        
        const parsed = JSON.parse(stored) as BankConnection;
        
        if (parsed.userId !== user.id) {
          await AsyncStorage.removeItem(STORAGE_KEY_BANK);
          return null;
        }
        
        return parsed;
      } catch (error) {
        console.error('Error loading bank connection:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_BANK);
        return null;
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (bankQuery.data !== undefined) {
      setConnection(bankQuery.data);
    }
  }, [bankQuery.data]);

  const saveBankConnectionMutation = useMutation({
    mutationFn: async (params: {
      accessToken: string;
      itemId: string;
      institutionName: string;
      institutionId: string;
      accounts: {
        id: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
      }[];
    }) => {
      if (!user) throw new Error('No user logged in');

      const bankConnection: BankConnection = {
        userId: user.id,
        accessToken: params.accessToken,
        itemId: params.itemId,
        accounts: params.accounts.map(acc => ({
          id: acc.id,
          institutionName: params.institutionName,
          institutionId: params.institutionId,
          accountName: acc.name,
          accountMask: acc.mask,
          accountType: acc.subtype,
          connectedAt: new Date().toISOString(),
        })),
        connectedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(bankConnection));
      return bankConnection;
    },
    onSuccess: (data) => {
      setConnection(data);
      console.log('Bank connection saved:', data);
    },
    onError: (error) => {
      console.error('Error saving bank connection:', error);
    },
  });

  const removeBankConnectionMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY_BANK);
    },
    onSuccess: () => {
      setConnection(null);
      console.log('Bank connection removed');
    },
  });

  useEffect(() => {
    if (!user && connection) {
      setConnection(null);
      AsyncStorage.removeItem(STORAGE_KEY_BANK);
    }
  }, [user, connection]);

  return useMemo(() => ({
    connection,
    isConnected: !!connection,
    isLoading: bankQuery.isLoading,
    saveBankConnection: saveBankConnectionMutation.mutate,
    removeBankConnection: removeBankConnectionMutation.mutate,
    isSaving: saveBankConnectionMutation.isPending,
    isRemoving: removeBankConnectionMutation.isPending,
  }), [connection, bankQuery.isLoading, saveBankConnectionMutation.mutate, saveBankConnectionMutation.isPending, removeBankConnectionMutation.mutate, removeBankConnectionMutation.isPending]);
});

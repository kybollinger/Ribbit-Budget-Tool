import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, CheckCircle2 } from 'lucide-react-native';
import { useAppearance } from '@/contexts/AppearanceContext';

interface PlaidLinkProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  linkToken: string;
}

export default function PlaidLink({ visible, onClose, onSuccess, onExit, linkToken }: PlaidLinkProps) {
  const { theme } = useAppearance();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'select' | 'connecting' | 'success'>('intro');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const demoBanks = [
    { id: 'chase', name: 'Chase', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏦' },
    { id: 'wells', name: 'Wells Fargo', logo: '🏦' },
    { id: 'citi', name: 'Citibank', logo: '🏦' },
    { id: 'capital', name: 'Capital One', logo: '🏦' },
  ];

  useEffect(() => {
    if (visible) {
      setStep('intro');
      setSelectedBank(null);
    }
  }, [visible]);

  const handleDemoConnect = (bankId: string, bankName: string) => {
    setSelectedBank(bankId);
    setStep('connecting');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      
      setTimeout(() => {
        const mockPublicToken = `public-sandbox-${Date.now()}`;
        const metadata = {
          institution: {
            name: bankName,
            institution_id: bankId,
          },
          accounts: [
            {
              id: `acc-${Date.now()}`,
              name: 'Checking Account',
              mask: '1234',
              type: 'depository',
              subtype: 'checking',
            },
          ],
          link_session_id: `link-${Date.now()}`,
        };
        
        onSuccess(mockPublicToken, metadata);
        onClose();
      }, 1500);
    }, 2000);
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>
              {step === 'intro' && 'Connect Your Bank'}
              {step === 'select' && 'Select Your Bank'}
              {step === 'connecting' && 'Connecting...'}
              {step === 'success' && 'Connected!'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={theme.colors.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {step === 'intro' && (
              <View style={styles.introContainer}>
                <Text style={[styles.introText, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>
                  Securely connect your bank account to automatically sync your transactions and track your spending.
                </Text>
                
                <View style={[styles.securityBadge, { backgroundColor: theme.accent.primaryLight }]}>
                  <CheckCircle2 size={20} color={theme.accent.primary} strokeWidth={2} />
                  <Text style={[styles.securityText, { fontSize: 14 * theme.textScale, color: theme.accent.primary }]}>
                    Bank-level encryption
                  </Text>
                </View>

                <Text style={[styles.demoModeTitle, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                  Demo Banks
                </Text>
                <Text style={[styles.demoModeDescription, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                  Select a demo bank to see how automatic syncing works
                </Text>

                <View style={styles.banksList}>
                  {demoBanks.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      style={[
                        styles.bankItem,
                        { 
                          backgroundColor: theme.colors.cardBackground,
                          borderColor: theme.colors.border,
                        }
                      ]}
                      onPress={() => handleDemoConnect(bank.id, bank.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.bankLogo}>{bank.logo}</Text>
                      <Text style={[styles.bankName, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>
                        {bank.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'connecting' && (
              <View style={styles.connectingContainer}>
                <ActivityIndicator size="large" color={theme.accent.primary} />
                <Text style={[styles.connectingText, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                  Connecting to {demoBanks.find(b => b.id === selectedBank)?.name}...
                </Text>
                <Text style={[styles.connectingSubtext, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                  Please wait while we securely connect your account
                </Text>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <View style={[styles.successIconContainer, { backgroundColor: theme.accent.primaryLight }]}>
                  <CheckCircle2 size={60} color={theme.accent.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.successText, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>
                  Successfully Connected!
                </Text>
                <Text style={[styles.successSubtext, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                  Your bank account is now linked and ready to sync
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  introContainer: {
    gap: 20,
  },
  introText: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  demoModeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  demoModeDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: -8,
  },
  banksList: {
    gap: 12,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bankLogo: {
    fontSize: 28,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  connectingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  connectingSubtext: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

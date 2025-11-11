import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
} from 'react-native';
import { DemoTransaction } from '@/mocks/demoTransactions';
import TransactionCard from './TransactionCard';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Check, X, RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;
const CARD_HEIGHT = 420;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface ShuffleStackProps {
  transactions: DemoTransaction[];
  onApprove?: (transaction: DemoTransaction) => void;
  onReject?: (transaction: DemoTransaction) => void;
}

export default function ShuffleStack({
  transactions,
  onApprove,
  onReject,
}: ShuffleStackProps) {
  const { theme } = useAppearance();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [removedCards, setRemovedCards] = useState<DemoTransaction[]>([]);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeDirection = useRef<'left' | 'right' | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        if (gesture.dx > 50) {
          swipeDirection.current = 'right';
        } else if (gesture.dx < -50) {
          swipeDirection.current = 'left';
        } else {
          swipeDirection.current = null;
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleSwipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
    swipeDirection.current = null;
  };

  const handleSwipeRight = () => {
    const currentTransaction = transactions[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (onApprove && currentTransaction) {
        onApprove(currentTransaction);
      }
      setRemovedCards([...removedCards, currentTransaction]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleSwipeLeft = () => {
    const currentTransaction = transactions[currentIndex];
    
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (onReject && currentTransaction) {
        onReject(currentTransaction);
      }
      setRemovedCards([...removedCards, currentTransaction]);
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleUndo = () => {
    if (removedCards.length === 0) return;
    
    const lastCard = removedCards[removedCards.length - 1];
    setRemovedCards(removedCards.slice(0, -1));
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const getCardStyle = (index: number) => {
    const isCurrentCard = index === currentIndex;
    
    if (isCurrentCard) {
      const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-15deg', '0deg', '15deg'],
        extrapolate: 'clamp',
      });

      const opacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
      });

      return {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
        opacity,
        zIndex: 10,
      };
    }

    const offset = index - currentIndex;
    if (offset > 2) return { opacity: 0, zIndex: -1 };

    return {
      transform: [
        { scale: 1 - offset * 0.05 },
        { translateY: offset * 10 },
      ],
      opacity: 1 - offset * 0.3,
      zIndex: 10 - offset,
    };
  };

  const getOverlayOpacity = (direction: 'left' | 'right') => {
    return position.x.interpolate({
      inputRange:
        direction === 'left'
          ? [-SCREEN_WIDTH / 2, 0]
          : [0, SCREEN_WIDTH / 2],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  if (currentIndex >= transactions.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.emptyText, { fontSize: 18 * theme.textScale, color: theme.colors.text.secondary }]}>
          All caught up! 🎉
        </Text>
        <Text style={[styles.emptySubtext, { fontSize: 14 * theme.textScale, color: theme.colors.text.tertiary }]}>
          No more transactions to review
        </Text>
        {removedCards.length > 0 && (
          <TouchableOpacity
            style={[styles.undoButton, { backgroundColor: theme.accent.primary }]}
            onPress={handleUndo}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color="#fff" strokeWidth={2.5} />
            <Text style={[styles.undoButtonText, { fontSize: 16 * theme.textScale }]}>Undo Last</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        {transactions.slice(currentIndex, currentIndex + 3).map((transaction, i) => {
          const actualIndex = currentIndex + i;
          const isCurrentCard = actualIndex === currentIndex;

          return (
            <Animated.View
              key={transaction.id}
              style={[
                styles.cardWrapper,
                getCardStyle(actualIndex),
              ]}
              {...(isCurrentCard ? panResponder.panHandlers : {})}
            >
              <View style={styles.cardContainer}>
                <TransactionCard transaction={transaction} />
              </View>

              {isCurrentCard && (
                <>
                  <Animated.View
                    style={[
                      styles.overlay,
                      styles.rejectOverlay,
                      { opacity: getOverlayOpacity('left') },
                    ]}
                  >
                    <View style={[styles.overlayIcon, { backgroundColor: '#EF4444' }]}>
                      <X size={40} color="#fff" strokeWidth={3} />
                    </View>
                    <Text style={[styles.overlayText, { fontSize: 24 * theme.textScale }]}>REJECT</Text>
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.overlay,
                      styles.approveOverlay,
                      { opacity: getOverlayOpacity('right') },
                    ]}
                  >
                    <View style={[styles.overlayIcon, { backgroundColor: '#10B981' }]}>
                      <Check size={40} color="#fff" strokeWidth={3} />
                    </View>
                    <Text style={[styles.overlayText, { fontSize: 24 * theme.textScale }]}>APPROVE</Text>
                  </Animated.View>
                </>
              )}
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleSwipeLeft}
          activeOpacity={0.8}
        >
          <X size={28} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        {removedCards.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.undoSmallButton, { backgroundColor: theme.colors.text.tertiary }]}
            onPress={handleUndo}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={handleSwipeRight}
          activeOpacity={0.8}
        >
          <Check size={28} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
          {currentIndex + 1} / {transactions.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT + 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    gap: 16,
  },
  rejectOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  approveOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  overlayIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  undoSmallButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  emptyContainer: {
    height: CARD_HEIGHT + 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  undoButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

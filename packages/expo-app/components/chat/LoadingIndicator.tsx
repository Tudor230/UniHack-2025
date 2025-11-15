import { StyleSheet, View, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LoadingIndicator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dotColor = isDark ? '#8E8E93' : '#666666';

  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -4, duration: 250, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ])
      );

    makeAnim(a1, 0).start();
    makeAnim(a2, 150).start();
    makeAnim(a3, 300).start();
  }, [a1, a2, a3]);

  return (
    <View style={styles.rowBot}>
      <View style={styles.containerBotWidth}>
        <View style={styles.contentRow}>
          <View style={[styles.accentLine, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
          <View style={styles.transparentBubble}>
            <View style={styles.dotsRow}>
              <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a1 }] }]} />
              <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a2 }] }]} />
              <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a3 }] }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBot: { paddingHorizontal: 12, marginVertical: 6, flexDirection: 'row', justifyContent: 'flex-start' },
  containerBotWidth: { maxWidth: '100%' },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  transparentBubble: { paddingVertical: 8, paddingHorizontal: 8 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  accentLine: { width: 2, alignSelf: 'stretch', borderRadius: 1 },
});
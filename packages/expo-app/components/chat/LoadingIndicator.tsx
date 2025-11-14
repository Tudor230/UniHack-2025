import { StyleSheet, View, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LoadingIndicator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dotColor = isDark ? Colors.dark.text : Colors.light.icon;
  const bg = isDark ? '#2C2C2E' : '#EFEFF4';

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
      <View style={[styles.bubble, { backgroundColor: bg }]}> 
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a1 }] }]} />
          <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a2 }] }]} />
          <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: a3 }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBot: { paddingHorizontal: 12, marginVertical: 6, flexDirection: 'row', justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 16 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
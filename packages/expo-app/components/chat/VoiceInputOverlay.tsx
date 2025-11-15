import { Modal, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export default function VoiceInputOverlay({ visible, transcription, onStop }: {
  visible: boolean;
  transcription: string;
  onStop: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Pulse animation for mic icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations
      const createWaveAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createWaveAnimation(waveAnim1, 0).start();
      createWaveAnimation(waveAnim2, 200).start();
      createWaveAnimation(waveAnim3, 400).start();
    }
  }, [visible]);
  
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }]}>
          {/* Waveform container */}
          <View style={styles.waveContainer}>
            <Animated.View style={[
              styles.wave,
              {
                opacity: waveAnim1,
                transform: [{ scale: waveAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.8]
                })}],
                backgroundColor: isDark ? 'rgba(255, 69, 58, 0.2)' : 'rgba(255, 59, 48, 0.2)',
              }
            ]} />
            <Animated.View style={[
              styles.wave,
              {
                opacity: waveAnim2,
                transform: [{ scale: waveAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5]
                })}],
                backgroundColor: isDark ? 'rgba(255, 69, 58, 0.3)' : 'rgba(255, 59, 48, 0.3)',
              }
            ]} />
            <Animated.View style={[
              styles.wave,
              {
                opacity: waveAnim3,
                transform: [{ scale: waveAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })}],
                backgroundColor: isDark ? 'rgba(255, 69, 58, 0.4)' : 'rgba(255, 59, 48, 0.4)',
              }
            ]} />
            
            {/* Mic icon */}
            <Animated.View style={[
              styles.micContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Ionicons name="mic" size={36} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* Status text */}
          <View style={styles.textContainer}>
            <Text style={[styles.statusText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {transcription && transcription !== 'Listening...' && transcription !== 'Recording your voice...' 
                ? 'Voice captured' 
                : 'Listening...'}
            </Text>
            {transcription && transcription !== 'Listening...' && transcription !== 'Recording your voice...' && (
              <Text style={[styles.transcriptionText, { color: isDark ? '#AAAAAA' : '#666666' }]} numberOfLines={3}>
                "{transcription}"
              </Text>
            )}
          </View>

          {/* Stop button */}
          <TouchableOpacity 
            style={[styles.stopBtn, { 
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            }]} 
            onPress={onStop}
            activeOpacity={0.7}
          >
            <View style={styles.stopBtnContent}>
              <View style={[styles.stopIcon, { backgroundColor: isDark ? '#FF453A' : '#FF3B30' }]} />
              <Text style={[styles.stopText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Stop Recording
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sheet: { 
    width: '85%', 
    maxWidth: 400,
    borderRadius: 24, 
    padding: 32, 
    alignItems: 'center',
    gap: 24,
  },
  waveContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  micContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  statusText: { 
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  transcriptionText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  stopBtn: { 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
  },
  stopBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stopIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  stopText: { 
    textAlign: 'center', 
    fontSize: 16,
    fontWeight: '600',
  },
});
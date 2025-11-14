import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function InputBar({ value, onChangeText, onSend, isListening, onToggleVoice }: {
  value: string;
  onChangeText: (v: string) => void;
  onSend: () => void;
  isListening: boolean;
  onToggleVoice: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const disabled = !value?.trim();
  
  return (
    <View style={[styles.wrap, { borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
      <View style={[styles.inputContainer, { 
        backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9',
      }]}>
        <TextInput
          style={[styles.input, { 
            color: Colors[colorScheme ?? 'light'].text 
          }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Type a message"
          placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          multiline
        />
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.voiceBtn, isListening && styles.voiceBtnActive]} 
            onPress={onToggleVoice}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={22} 
              color={isListening ? '#FFFFFF' : (isDark ? '#8E8E93' : '#666666')} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendBtn, disabled && styles.sendBtnDisabled]} 
            onPress={onSend} 
            disabled={disabled}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, gap: 8, borderTopWidth: 1 },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 8 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceBtn: { padding: 6, borderRadius: 20 },
  voiceBtnActive: { backgroundColor: '#FF3B30' },
  sendBtn: { 
    backgroundColor: '#007AFF', 
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
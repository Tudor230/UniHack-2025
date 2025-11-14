import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function InputBar({ value, onChangeText, onSend, isListening, onToggleVoice, onOpenCamera, attachmentUri, onRemoveAttachment }: {
  value: string;
  onChangeText: (v: string) => void;
  onSend: () => void;
  isListening: boolean;
  onToggleVoice: () => void;
  onOpenCamera: () => void;
  attachmentUri?: string;
  onRemoveAttachment?: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const disabled = !value?.trim() && !attachmentUri;
  
  return (
    <View style={[styles.wrap, { borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
      <View style={[
        styles.inputContainer,
        { backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' },
        attachmentUri ? styles.inputContainerTaller : null,
      ]}>
        {attachmentUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: attachmentUri }} style={styles.preview} contentFit="cover" />
            <TouchableOpacity style={styles.removeBtn} onPress={onRemoveAttachment}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}
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
            style={styles.cameraBtn}
            onPress={onOpenCamera}
          >
            <Ionicons 
              name="camera-outline" 
              size={22} 
              color={isDark ? '#8E8E93' : '#666666'} 
            />
          </TouchableOpacity>
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
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingLeft: 12, paddingRight: 4, paddingVertical: 4 },
  inputContainerTaller: { minHeight: 44 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 8 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cameraBtn: { padding: 6, borderRadius: 20 },
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
  previewWrap: { width: 40, height: 40, borderRadius: 8, overflow: 'hidden', marginRight: 8, position: 'relative' },
  preview: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: '#00000088', borderRadius: 10, padding: 2, zIndex: 1 },
});
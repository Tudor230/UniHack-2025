import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useChatHistory } from '@/state/chat-history';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecentChatsSidebar({ visible, onClose, onSelect, onNewChat }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state, deleteSession, renameSession } = useChatHistory();
  const [query, setQuery] = useState('');
  const translateX = useSharedValue(-320);
  const overlayOpacity = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.sessions;
    return state.sessions.filter(s => (s.title.toLowerCase().includes(q) || s.messages.some(m => (m.text ?? '').toLowerCase().includes(q))));
  }, [query, state.sessions]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : -320, { duration: 200 });
    overlayOpacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#00000066' }, backdropStyle]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View style={[
        styles.panel,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' },
        panelStyle,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }
      ]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Recent Chats</Text>
          <Pressable onPress={onNewChat} style={[styles.newBtn, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA' }]}>
            <Ionicons name="add" size={18} color={colorScheme === 'dark' ? '#FFFFFF' : '#333333'} />
          </Pressable>
        </View>
        <View style={[styles.searchWrap, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
          <Ionicons name="search" size={16} color={isDark ? '#8E8E93' : '#666666'} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable style={styles.rowMain} onPress={() => onSelect(item.id)}>
                <View style={styles.rowTitleWrap}>
                  {editingId === item.id ? (
                    <TextInput
                      style={[styles.rowTitleInput, { color: Colors[colorScheme ?? 'light'].text, borderColor: isDark ? '#38383A' : '#E5E5EA' }]}
                      value={tempTitle}
                      onChangeText={setTempTitle}
                    />
                  ) : (
                    <Text style={[styles.rowTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>{item.title}</Text>
                  )}
                  {item.unsynced ? (
                    <Ionicons name="cloud-offline-outline" size={18} color={isDark ? '#8E8E93' : '#666666'} />
                  ) : null}
                </View>
              </Pressable>
              <View style={styles.rowActions}>
                {editingId === item.id ? (
                  <>
                    <Pressable style={styles.iconBtn} onPress={() => { renameSession(item.id, tempTitle.trim() || item.title); setEditingId(null); }}>
                      <Ionicons name="checkmark" size={18} color={isDark ? '#8E8E93' : '#666666'} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => { setEditingId(null); setTempTitle(''); }}>
                      <Ionicons name="close" size={18} color={isDark ? '#8E8E93' : '#666666'} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable style={styles.iconBtn} onPress={() => { setEditingId(item.id); setTempTitle(item.title); }}>
                      <Ionicons name="create-outline" size={18} color={isDark ? '#8E8E93' : '#666666'} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => {
                      Alert.alert('Delete chat', 'Are you sure you want to delete this chat?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteSession(item.id) },
                      ]);
                    }}>
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 320, borderRightWidth: 1, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15 },
  sep: { height: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  rowMain: { flex: 1 },
  rowTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontSize: 16, lineHeight: 20, fontWeight: '500', flexShrink: 1 },
  rowTitleInput: { flexShrink: 1, fontSize: 16, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 8 },
  rowSub: { fontSize: 13, marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  iconBtn: { padding: 6, borderRadius: 20 },
});
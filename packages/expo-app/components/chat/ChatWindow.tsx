import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ChatMessage } from './types';
import MessageBubble from './MessageBubble';
import MapMessage from './MapMessage';
import LoadingIndicator from './LoadingIndicator';
import SuggestionChips from './SuggestionChips';
 

export default function ChatWindow({ messages, isLoading, onChipPress, onImageOpen }: {
  messages: ChatMessage[];
  isLoading: boolean;
  onChipPress: (s: string) => void;
  onImageOpen: (uri: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');
  const suggestions = lastBot?.suggestions ?? [];
  console.log(messages[0].mapItems);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) =>
          item.type === 'map' && item.mapItems && item.mapItems.length > 0 ? (
            (() => { try { console.log('ChatWindow render map message', item.id, item.mapItems?.length); } catch {} })(),
            <MapMessage item={item.mapItems[0]} />
          ) : (
            <MessageBubble message={item} onImagePress={(uri) => { onImageOpen(uri); }} />
          )
        }
        inverted
        contentContainerStyle={{ paddingBottom: insets.top + 64 }}
      />
      {isLoading ? <LoadingIndicator /> : null}
      <SuggestionChips suggestions={suggestions} onChipPress={onChipPress} />
    </View>
  );
}
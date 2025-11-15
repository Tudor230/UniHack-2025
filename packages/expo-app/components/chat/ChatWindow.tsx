import { FlatList, View } from 'react-native';
import { useState } from 'react';
import { ChatMessage } from './types';
import MessageBubble from './MessageBubble';
import RichContentCard from './RichContentCard';
import LoadingIndicator from './LoadingIndicator';
import SuggestionChips from './SuggestionChips';
 

export default function ChatWindow({ messages, isLoading, onChipPress, onImageOpen }: {
  messages: ChatMessage[];
  isLoading: boolean;
  onChipPress: (s: string) => void;
  onImageOpen: (uri: string) => void;
}) {
  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');
  const suggestions = lastBot?.suggestions ?? [];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) =>
          item.type === 'card' && item.card ? (
            <RichContentCard card={item.card} />
          ) : (
            <MessageBubble message={item} onImagePress={(uri) => { onImageOpen(uri); }} />
          )
        }
        inverted
      />
      {isLoading ? <LoadingIndicator /> : null}
      <SuggestionChips suggestions={suggestions} onChipPress={onChipPress} />
    </View>
  );
}
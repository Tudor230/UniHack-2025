import React from 'react';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Fonts } from '@/constants/theme';

export default function MarkdownText({ content, color }: { content: string; color: string }) {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  const styles = {
    body: { color, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans },
    text: { color, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans },
    link: { color: tint, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans },
    code_inline: { fontFamily: Fonts.mono, backgroundColor: '#00000022', borderRadius: 4, paddingHorizontal: 4, color },
    code_block: { fontFamily: Fonts.mono, backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#F2F2F7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 0, color },
    blockquote: { borderLeftWidth: 3, borderLeftColor: scheme === 'dark' ? '#38383A' : '#E5E5EA', paddingLeft: 8, marginTop: 0, marginBottom: 0 },
    hr: { height: 1, backgroundColor: scheme === 'dark' ? '#38383A' : '#E5E5EA', marginVertical: 0 },
    heading1: { color, fontWeight: '700', fontSize: 28, letterSpacing: 0.2, lineHeight: 34, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    heading2: { color, fontWeight: '700', fontSize: 24, letterSpacing: 0.2, lineHeight: 30, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    heading3: { color, fontWeight: '700', fontSize: 20, letterSpacing: 0.2, lineHeight: 26, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    heading4: { color, fontWeight: '700', fontSize: 18, letterSpacing: 0.2, lineHeight: 24, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    heading5: { color, fontWeight: '700', fontSize: 16, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    heading6: { color, fontWeight: '700', fontSize: 14, letterSpacing: 0.2, lineHeight: 20, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    list_item: { color, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
    paragraph: { color, letterSpacing: 0.2, lineHeight: 22, fontFamily: Fonts.sans, marginTop: 0, marginBottom: 0 },
  } as const;
  return <Markdown style={styles}>{content}</Markdown>;
}
import { Linking, Platform, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Fonts } from '@/constants/theme';

type InlineToken = { t: 'text' | 'bold' | 'italic' | 'code' | 'link'; v: string; u?: string };

function parseInline(input: string): InlineToken[] {
  const out: InlineToken[] = [];
  let i = 0;
  let buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  while (i < input.length) {
    if (input[i] === '`') {
      flush();
      let j = i + 1;
      while (j < input.length && input[j] !== '`') j++;
      const code = input.slice(i + 1, j);
      out.push({ t: 'code', v: code });
      i = j + 1;
      continue;
    }
    if (input[i] === '*' && input[i + 1] === '*') {
      flush();
      let j = i + 2;
      while (j < input.length && !(input[j] === '*' && input[j + 1] === '*')) j++;
      const strong = input.slice(i + 2, j);
      out.push({ t: 'bold', v: strong });
      i = j + 2;
      continue;
    }
    if (input[i] === '*' && input[i + 1] !== '*') {
      flush();
      let j = i + 1;
      while (j < input.length && input[j] !== '*') j++;
      const em = input.slice(i + 1, j);
      out.push({ t: 'italic', v: em });
      i = j + 1;
      continue;
    }
    if (input[i] === '[') {
      const endText = input.indexOf(']', i + 1);
      const startUrl = input.indexOf('(', endText + 1);
      const endUrl = input.indexOf(')', startUrl + 1);
      if (endText > -1 && startUrl > -1 && endUrl > -1) {
        flush();
        const txt = input.slice(i + 1, endText);
        const url = input.slice(startUrl + 1, endUrl);
        out.push({ t: 'link', v: txt, u: url });
        i = endUrl + 1;
        continue;
      }
    }
    buf += input[i];
    i++;
  }
  flush();
  return out;
}

function renderInline(tokens: InlineToken[], color: string, tint: string) {
  return tokens.map((s, idx) => {
    const common = [
      { color },
      { flexShrink: 0 },
      Platform.OS === 'android'
        ? ({ textBreakStrategy: 'simple', android_hyphenationFrequency: 'none', includeFontPadding: false } as any)
        : ({ lineBreakStrategy: 'pushOut' } as any),
    ];
    if (s.t === 'bold') return <ThemedText key={idx} style={[...common, { fontWeight: '700' }]}>{s.v}</ThemedText>;
    if (s.t === 'italic') return <ThemedText key={idx} style={[...common, { fontStyle: 'italic' }]}>{s.v}</ThemedText>;
    if (s.t === 'code') return <ThemedText key={idx} style={[...common, { fontFamily: Fonts.mono, backgroundColor: '#00000022', borderRadius: 4, paddingHorizontal: 4 }]}>{s.v}</ThemedText>;
    if (s.t === 'link') return (
      <ThemedText key={idx} style={[...common, { color: tint }]} onPress={() => s.u ? Linking.openURL(s.u) : null}>
        {s.v}
      </ThemedText>
    );
    return <ThemedText key={idx} style={common as any}>{s.v}</ThemedText>;
  });
}

export default function MarkdownText({ content, color }: { content: string; color: string }) {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: Array<{ k: 'h' | 'ul' | 'ol' | 'p' | 'code' | 'quote' | 'hr'; l?: number; t?: string; items?: string[]; code?: string }> = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      let j = i + 1;
      const acc: string[] = [];
      while (j < lines.length && !/^```\s*$/.test(lines[j])) { acc.push(lines[j]); j++; }
      blocks.push({ k: 'code', code: acc.join('\n') });
      i = j + 1;
      continue;
    }
    if (/^\s*---\s*$/.test(line)) { blocks.push({ k: 'hr' }); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push({ k: 'h', l: h[1].length, t: h[2] }); i++; continue; }
    if (/^(\*|-)\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^(\*|-)\s+/.test(lines[j])) { items.push(lines[j].replace(/^(\*|-)\s+/, '')); j++; }
      blocks.push({ k: 'ul', items });
      i = j;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\.\s+/.test(lines[j])) { items.push(lines[j].replace(/^\d+\.\s+/, '')); j++; }
      blocks.push({ k: 'ol', items });
      i = j;
      continue;
    }
    if (/^>\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^>\s+/.test(lines[j])) { items.push(lines[j].replace(/^>\s+/, '')); j++; }
      blocks.push({ k: 'quote', t: items.join('\n') });
      i = j;
      continue;
    }
    if (line.trim().length === 0) { blocks.push({ k: 'p', t: '' }); i++; continue; }
    const acc: string[] = [line];
    let j = i + 1;
    while (j < lines.length && lines[j].trim().length > 0) { acc.push(lines[j]); j++; }
    blocks.push({ k: 'p', t: acc.join('\n') });
    i = j;
  }
  return (
    <View>
      {blocks.map((b, idx) => {
        if (b.k === 'h') {
          const sizes = [28, 24, 20, 18, 16, 14];
          const size = sizes[Math.min(Math.max((b.l || 1) - 1, 0), 5)];
          return (
            <View key={idx} style={{ marginBottom: 6 }}>
              <ThemedText style={{ color, fontWeight: '700', fontSize: size }}>{b.t}</ThemedText>
            </View>
          );
        }
        if (b.k === 'ul') {
          return (
            <View key={idx} style={{ marginBottom: 6 }}>
              {b.items?.map((it, i2) => (
                <View key={i2} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <ThemedText style={{ color }}>{'• '}</ThemedText>
                  <View style={{ flexShrink: 1 }}>{renderInline(parseInline(it), color, tint)}</View>
                </View>
              ))}
            </View>
          );
        }
        if (b.k === 'ol') {
          return (
            <View key={idx} style={{ marginBottom: 6 }}>
              {b.items?.map((it, i2) => (
                <View key={i2} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <ThemedText style={{ color }}>{`${i2 + 1}. `}</ThemedText>
                  <View style={{ flexShrink: 1 }}>{renderInline(parseInline(it), color, tint)}</View>
                </View>
              ))}
            </View>
          );
        }
        if (b.k === 'code') {
          return (
            <View key={idx} style={{ backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#F2F2F7', borderRadius: 8, padding: 8, marginBottom: 8 }}>
              <ThemedText style={{ color, fontFamily: Fonts.mono }}>{b.code}</ThemedText>
            </View>
          );
        }
        if (b.k === 'quote') {
          return (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={{ width: 3, backgroundColor: scheme === 'dark' ? '#38383A' : '#E5E5EA', marginRight: 8, borderRadius: 2 }} />
              <View style={{ flexShrink: 1 }}>{renderInline(parseInline(b.t || ''), color, tint)}</View>
            </View>
          );
        }
        if (b.k === 'hr') {
          return <View key={idx} style={{ height: 1, backgroundColor: scheme === 'dark' ? '#38383A' : '#E5E5EA', marginVertical: 8 }} />;
        }
        if ((b.t || '').length === 0) return <View key={idx} style={{ height: 6 }} />;
        return (
          <View key={idx} style={{ marginBottom: 6 }}>
            {renderInline(parseInline(b.t || ''), color, tint)}
          </View>
        );
      })}
    </View>
  );
}
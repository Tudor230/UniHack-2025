export type Coords = { latitude: number; longitude: number };

export function normalizeCoords(input: any): Coords | undefined {
  if (!input) return undefined;

  const toNum = (v: any) => {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  if (typeof input === 'string') {
    try {
      const obj = JSON.parse(input);
      return normalizeCoords(obj);
    } catch {}
    const parts = input.replace(/[()]/g, '').split(/[;,\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = toNum(parts[0]);
      const b = toNum(parts[1]);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
    const latMatch = input.match(/lat(?:itude)?\s*[:=]\s*([-+]?\d+(?:\.\d+)?)/i);
    const lonMatch = input.match(/lon(?:gitude)?\s*[:=]\s*([-+]?\d+(?:\.\d+)?)/i);
    if (latMatch && lonMatch) {
      const a = toNum(latMatch[1]);
      const b = toNum(lonMatch[1]);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
    return undefined;
  }

  if (Array.isArray(input) && input.length >= 2) {
    const a = toNum(input[0]);
    const b = toNum(input[1]);
    if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
  }

  if (typeof input === 'object') {
    if ('coords' in input) return normalizeCoords((input as any).coords);
    if ('geometry' in input && (input as any).geometry?.coordinates) {
      const [lon, lat] = (input as any).geometry.coordinates as any[];
      const a = toNum(lat);
      const b = toNum(lon);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
    if ('coordinates' in input && Array.isArray((input as any).coordinates)) {
      const [lon, lat] = (input as any).coordinates as any[];
      const a = toNum(lat);
      const b = toNum(lon);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
    if ('latitude' in input && 'longitude' in input) {
      const a = toNum((input as any).latitude);
      const b = toNum((input as any).longitude);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
    if ('lat' in input && 'lng' in input) {
      const a = toNum((input as any).lat);
      const b = toNum((input as any).lng);
      if (a !== undefined && b !== undefined) return { latitude: a, longitude: b };
    }
  }

  return undefined;
}
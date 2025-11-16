import { normalizeCoords } from '../utils/coords';

const samples: any[] = [
  { latitude: 46.766667, longitude: 23.583333 },
  { lat: '46.766667', lng: '23.583333' },
  { coordinates: [23.583333, 46.766667] },
  { coords: [46.766667, 23.583333] },
  '46.766667,23.583333',
  'lat: 46.766667; lon: 23.583333',
  { geometry: { type: 'Point', coordinates: [23.583333, 46.766667] } },
  [46.766667, 23.583333],
  '(46.766667, 23.583333)',
  { coords: '{"latitude": 41.8902, "longitude": 12.4922}' },
  { coords: { latitude: 41.8902, longitude: 12.4922 } }
];

const results = samples.map((s) => ({ input: s, output: normalizeCoords((s as any)?.coords ?? s) }));
console.log(JSON.stringify(results, null, 2));
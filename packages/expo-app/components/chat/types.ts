export type ChatAction = {
  type: 'showOnMap' | 'book';
  label: string;
  url?: string;
  payload?: any;
};

export type ChatCard = {
  imageUrl?: string;
  title: string;
  description?: string;
  actions?: ChatAction[];
};

export type MapItem = {
  landmarkName: string;
  publicAccess?: string;
  coords?: { lat: number; long: number };
  about?: string;
  openingHours?: string;
  ticketPrices?: string;
  website?: string;
  id?: number | string;
  createdAt?: string | number;
  updatedAt?: string | number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  type: 'text' | 'card' | 'map';
  text?: string;
  card?: ChatCard;
  mapItems?: MapItem[];
  imageUri?: string;
  suggestions?: string[];
  ts: number;
};
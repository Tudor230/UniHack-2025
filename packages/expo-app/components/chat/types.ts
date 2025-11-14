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

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  type: 'text' | 'card';
  text?: string;
  card?: ChatCard;
  imageUri?: string;
  suggestions?: string[];
  ts: number;
};
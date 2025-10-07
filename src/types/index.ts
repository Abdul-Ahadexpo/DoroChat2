export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface BotResponse {
  [key: string]: string;
}

export interface UnknownQuestion {
  id: string;
  question: string;
  text: string;
  timestamp: number;
  count: number;
  userID?: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
  inStock: boolean;
  imageUrl?: string;
  features?: string[];
  specifications?: { [key: string]: string };
}

export interface SiteData {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'service' | 'policy' | 'faq' | 'general';
  tags: string[];
  lastUpdated: number;
}
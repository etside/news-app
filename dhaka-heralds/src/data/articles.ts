export type Urgency = 'breaking' | 'high' | 'normal' | 'low';
export type Section = 'home' | 'analysis' | 'opinion' | 'world' | 'tech';

export interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  time: string;
  urgency: Urgency;
  featured?: boolean;
  // Extended fields for embed/ownership support
  embedUrl?: string;
  mediaType?: 'video' | 'image';
  owner?: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    website: string;
  };
  engagement?: { likes: number; comments: number };
  sourceId?: string;
}

// Existing editorial articles (Dhaka Heralds staff)
const EDITORIAL_ARTICLES: Article[] = [
  { id: 1, category: 'Politics', title: 'Bangladesh Parliament Approves New Digital Governance Bill', excerpt: 'The landmark legislation aims to digitize all government services by 2028, making Bangladesh a leader in South Asian e-governance.', image: 'https://picsum.photos/seed/dhaka1/600/400', time: '2h ago', urgency: 'breaking', featured: true },
  { id: 2, category: 'Economy', title: 'Dhaka Stock Exchange Hits Record High Amid Foreign Investment Surge', excerpt: 'Foreign direct investment reaches $4.2 billion in the first half of 2026.', image: 'https://picsum.photos/seed/dhaka2/600/350', time: '3h ago', urgency: 'high' },
  { id: 3, category: 'Technology', title: 'Bangladeshi Startup Raises $50M Series B for AI-Powered Agriculture', excerpt: 'The Dhaka-based company uses satellite imagery and AI to help farmers optimize crop yields.', image: 'https://picsum.photos/seed/dhaka3/600/500', time: '4h ago', urgency: 'normal' },
  { id: 4, category: 'Sports', title: 'Bangladesh Cricket Team Prepares for World Cup Semifinal', excerpt: 'The Tigers are confident after a dominant group stage performance.', image: 'https://picsum.photos/seed/dhaka4/600/300', time: '5h ago', urgency: 'normal' },
  { id: 5, category: 'Culture', title: 'UNESCO Recognizes Bangladeshi Jamdani Weaving as Intangible Heritage', excerpt: 'The centuries-old textile art receives global recognition for its intricate craftsmanship.', image: 'https://picsum.photos/seed/dhaka5/600/450', time: '6h ago', urgency: 'low' },
  { id: 6, category: 'Environment', title: 'Sundarbans Mangrove Restoration Project Shows Promising Results', excerpt: 'Satellite data reveals 12% increase in mangrove cover over the past two years.', image: 'https://picsum.photos/seed/dhaka6/600/380', time: '7h ago', urgency: 'normal' },
  { id: 7, category: 'Health', title: 'New Medical College Opens in Chattogram to Serve Southern Region', excerpt: 'The 500-bed facility will provide specialized healthcare to millions.', image: 'https://picsum.photos/seed/dhaka7/600/420', time: '8h ago', urgency: 'low' },
  { id: 8, category: 'Education', title: 'Dhaka University Launches South Asia\'s First Quantum Computing Lab', excerpt: 'The lab will focus on research in cryptography and materials science.', image: 'https://picsum.photos/seed/dhaka8/600/350', time: '9h ago', urgency: 'high' },
  { id: 9, category: 'Politics', title: 'Metro Rail Phase 3 Construction Begins in Uttara', excerpt: 'The extension will connect the northern suburbs to the city center.', image: 'https://picsum.photos/seed/dhaka9/600/480', time: '10h ago', urgency: 'normal' },
  { id: 10, category: 'Economy', title: 'Garment Industry Adopts Sustainable Manufacturing Practices', excerpt: 'Major factories transition to renewable energy and zero-waste production.', image: 'https://picsum.photos/seed/dhaka10/600/320', time: '11h ago', urgency: 'low' },
  { id: 11, category: 'Technology', title: 'Bangladesh Launches National AI Strategy 2030', excerpt: 'The comprehensive plan outlines ethical AI development across all sectors.', image: 'https://picsum.photos/seed/dhaka11/600/400', time: '12h ago', urgency: 'high' },
  { id: 12, category: 'Culture', title: 'Pohela Boishakh Celebrations Draw Millions to Ramna Batamul', excerpt: 'The Bengali New Year is marked by music, art, and traditional cuisine.', image: 'https://picsum.photos/seed/dhaka12/600/360', time: '1d ago', urgency: 'low' },
];

// Instagram embed articles (real content with ownership)
import { getInstagramArticles } from './instagramPosts';
const INSTAGRAM_ARTICLES = getInstagramArticles();

// Merged feed: editorial first, then Instagram embeds
export const ARTICLES: Article[] = [...EDITORIAL_ARTICLES, ...INSTAGRAM_ARTICLES];

export const CATEGORIES = ['All', 'Politics', 'Economy', 'Technology', 'Sports', 'Culture', 'Environment', 'Health', 'Education', 'Business', 'Digital'];

export const SECTIONS: { key: Section; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'opinion', label: 'Opinion' },
  { key: 'world', label: 'World' },
  { key: 'tech', label: 'Tech' },
];

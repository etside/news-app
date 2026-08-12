/**
 * Instagram post data parsed from instagram_posts_export.csv
 * Source: Engineers Tech BD (@engineerstech)
 * Exported: 2026-08-10
 */

export interface InstagramPost {
  id: string;
  type: 'VIDEO' | 'IMAGE';
  productType: 'REELS' | 'FEED';
  embedUrl: string;
  mediaUrl: string;
  thumbnailUrl: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  caption: string;
}

const OWNER = {
  name: 'Engineers Tech BD',
  handle: '@engineerstech',
  avatar: 'https://scontent-iad3-2.cdninstagram.com/v/t51.71878-15/770961690_1397384912303549_7410659233480653452_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=OkNWhugskUcQ7kNvwHsBFrL&_nc_oc=Adr5iig2gl4rWGLHiEjOpydzlf_yrc3CN8mnXx0GA-nVW-FT5vZry-NL46JI8LBTa9U&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=rKVsNoHUz-1H48tfRKm04w&_nc_tpa=Q5bMBQJvwi-HSYUESqJI4c7JyfYUQ3s57CfmghtRqYdmCRXMMgvCSmYwm_MBYB2VpFNuYjIncz3v3Zs8_A&oh=00_AQGTt3sKwpDGHtL3JRQOZwBOdkhJbk1jXZt3einy5uaXaQ&oe=6A819778',
  verified: true,
  website: 'https://engineerstechbd.com',
} as const;

function parseCaption(caption: string): { title: string; hashtags: string[] } {
  const lines = caption.split('\n').filter(l => l.trim());
  const hashtags = (caption.match(/#[\w]+/g) || []).filter(h => h.length > 2);
  const cleanLines = lines.filter(l => !l.startsWith('#'));
  const title = cleanLines[0]?.replace(/[*_]/g, '').trim() || 'Post';
  return { title: title.slice(0, 120), hashtags };
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function categoryFromHashtags(hashtags: string[]): string {
  const map: Record<string, string[]> = {
    'Technology': ['tech', 'software', 'ai', 'saas', 'web', 'app', 'development', 'erp', 'automation'],
    'Business': ['business', 'growth', 'marketing', 'brand', 'startup'],
    'Digital': ['digital', 'online', 'social', 'content', 'media'],
    'Development': ['developer', 'coding', 'programming'],
  };
  const lower = hashtags.map(h => h.toLowerCase().replace('#', ''));
  for (const [cat, keywords] of Object.entries(map)) {
    if (lower.some(h => keywords.some(k => h.includes(k)))) return cat;
  }
  return 'Technology';
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: '18200926624369871', type: 'VIDEO', productType: 'REELS',
    embedUrl: 'https://www.instagram.com/reel/Db2CqLkJqZg/',
    mediaUrl: 'https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQProV7F2wafJQKI_3qFHunb_kbr0HbL4x9phz16T0cW9jmWOv-51Ezs0Di5nxUbdFLSf0x08YzA5tHBzqgDKgBSV---ZWD9CpaC5WA.mp4',
    thumbnailUrl: 'https://scontent-iad3-2.cdninstagram.com/v/t51.71878-15/770961690_1397384912303549_7410659233480653452_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=OkNWhugskUcQ7kNvwHsBFrL&_nc_oc=Adr5iig2gl4rWGLHiEjOpydzlf_yrc3CN8mnXx0GA-nVW-FT5vZry-NL46JI8LBTa9U&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=rKVsNoHUz-1H48tfRKm04w&_nc_tpa=Q5bMBQJvwi-HSYUESqJI4c7JyfYUQ3s57CfmghtRqYdmCRXMMgvCSmYwm_MBYB2VpFNuYjIncz3v3Zs8_A&oh=00_AQGTt3sKwpDGHtL3JRQOZwBOdkhJbk1jXZt3einy5uaXaQ&oe=6A819778',
    timestamp: '2026-08-10T03:24:58+0000', likeCount: 1, commentsCount: 0,
    caption: 'For free consultation inbox or email us at hello@engineerstechbd.com\n#engineerstech #software #drivenbyengineers',
  },
  {
    id: '18063221672583530', type: 'VIDEO', productType: 'REELS',
    embedUrl: 'https://www.instagram.com/reel/Db1ezLYTD0G/',
    mediaUrl: 'https://scontent-iad3-1.cdninstagram.com/o1/v/t2/f2/m86/AQP83e3TP70kYePYmdM1jqZIYAbqgywyl-ZKsrhgZ6uHrzDHCSGgK95NbxrdmdnINeJ_XnjuEjVQjX7j-TdA7PKLW6dMfqJFgJ31KiM.mp4',
    thumbnailUrl: 'https://scontent-iad3-1.cdninstagram.com/v/t51.71878-15/771939608_1286768713381249_483879190150767893_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=wJ3ZKNsS7qkQ7kNvwFqal5G&_nc_oc=AdoYZm_kEuAOo_yGQ0Q4yveuCKps5VbMKr_QJtEvnKPfSWwNvqMF4UVXc2qkQhg66gg&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=rKVsNoHUz-1H48tfRKm04w&_nc_tpa=Q5bMBQJ9mn0orrF8nhTj3yzzzx1ST4CB9PZqXytR2CbhnBY6EsvDaK64etdJrYCAlgGqwxQvHuNFaZjdg&oh=00_AQGWmijc_hL5VKM_zQWznp-UwC_IvSNQATmKyCoBVbUA&oe=6A817B4D',
    timestamp: '2026-08-09T22:14:50+0000', likeCount: 1, commentsCount: 0,
    caption: 'engineersTech is the engine that lacks your business growth #engineerstech #business #drivenbyengineers',
  },
  {
    id: '18101003783164658', type: 'VIDEO', productType: 'REELS',
    embedUrl: 'https://www.instagram.com/reel/Db0cyoIjsNk/',
    mediaUrl: 'https://scontent-iad6-1.cdninstagram.com/o1/v/t2/f2/m86/AQOz8_w16Sv6XUeMWC9GaJjLl8Ex5S0iPs4CK1bJ64aF897CfWQdcLAOL9hoL9CMXgd6e1vivuGPx-_xNQIAiN-zH1iFoGCRaMnxCBE.mp4',
    thumbnailUrl: 'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/772109894_18002382692976701_692820758348331337_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=E85yOx8MgL0Q7kNvwGSkK8v&_nc_oc=AdoTO2Gk-EQSvjc0kiB_hrT4KChvn28S-VF8-9fNDj6qvta6eSI73W8HEOX5UOSNyyQ&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=rKVsNoHUz-1H48tfRKm04w&_nc_tpa=Q5bMBQLVc7r6s8yDkLNMGAP90ECzl4mN6Qpa-rbQb-TLykMSuomW_zmnNFF4vL9YCWDlxetfrzE5X4N6OA&oh=00_AQHg6O2d58EaG-EjFGPZgSX5AfPpRfHNJi4ZsfiVvhmg&oe=6A81888A',
    timestamp: '2026-08-09T12:34:45+0000', likeCount: 0, commentsCount: 0,
    caption: "Your business doesn't need more complexity. It needs the right technology. From building your digital foundation to improving operations and scaling your business — engineersTech helps turn business challenges into practical technology solutions.\n\n#drivenByEngineers #BusinessGrowth #CustomSoftware #AIIntegration #BusinessAutomation #saas",
  },
  {
    id: '18192097285376783', type: 'IMAGE', productType: 'FEED',
    embedUrl: 'https://www.instagram.com/p/Dbyh-1tTtmk/',
    mediaUrl: 'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/768361184_18002265722976701_6182173017995827569_n.heic?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=KhVj6ojsKx8Q7kNvwGUKcNt&_nc_oc=AdolOpFutH9_W7FWk3C4DsKpsFewNBn-VDlSCuv6pSTh1CpVn7DymqZF5Ul34j4FzlY&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=rKVsNoHUz-1H48tfRKm04w&_nc_tpa=Q5bMBQIPhsaXkBLep3GWrrsCH-sJSJO8aI_6nkqDO6CTbx0Wji6Ul7GfXhMAP_YQDrpSwWPQxGPt1eq19Q&oh=00_AQGA1m1zlwg-h6TpskeF8kCeGQNBdR68VKrdUcqrI17ngQ&oe=6A8192D1',
    thumbnailUrl: 'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/768361184_18002265722976701_6182173017995827569_n.jpg?stp=dst-jpg_e35_tt6',
    timestamp: '2026-08-08T18:41:21+0000', likeCount: 1, commentsCount: 0,
    caption: "Your business doesn't stop at development. **It needs to run, evolve, and grow.**\n\nFrom building your website and digital platforms to managing your online presence, content, advertising, performance, and ongoing improvements — you shouldn't have to coordinate with multiple teams for everything.\n\nWith engineersTech, get a **360\u00b0 complete online solution** built around your business.\n\n\u25b8 Website & Digital Platform Development\n\u25b8 Website Maintenance & Updates\n\u25b8 Social Media Content & Management\n\u25b8 Advertising & Campaign Management\n\u25b8 Performance & Growth Optimization\n\u25b8 Ongoing Technical Support",
  },
];

/**
 * Convert Instagram posts into the Article interface used by layouts.
 * Each post becomes an article card with embed link and ownership metadata.
 */
export function getInstagramArticles() {
  return INSTAGRAM_POSTS.map((post, i) => {
    const { title, hashtags } = parseCaption(post.caption);
    return {
      id: 9000 + i,
      category: categoryFromHashtags(hashtags),
      title,
      excerpt: post.caption.replace(/[*_]/g, '').replace(/#[\w]+/g, '').replace(/\n+/g, ' ').trim().slice(0, 200),
      image: post.thumbnailUrl || post.mediaUrl,
      time: timeAgo(post.timestamp),
      urgency: i === 0 ? 'high' as const : 'normal' as const,
      featured: i === 0,
      // Extended fields for embed support
      embedUrl: post.embedUrl,
      mediaType: post.productType === 'REELS' ? 'video' as const : 'image' as const,
      owner: OWNER,
      engagement: { likes: post.likeCount, comments: post.commentsCount },
      sourceId: post.id,
    };
  });
}

export const CONTENT_OWNER = OWNER;

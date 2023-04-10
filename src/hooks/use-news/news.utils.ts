import type { News } from './use-news.types';

export const isBlocked = (blocklist: string[], news: News) => {
  const title = 'en' in news ? news.en : news.title;
  const content = 'body' in news ? `${news.title} ${news.body}` : `${title}`;

  return !content?.trim() || blocklist.some((b) => content.toLowerCase().includes(b.toLowerCase()));
};

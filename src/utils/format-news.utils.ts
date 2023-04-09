import { memoize } from 'lodash';

import type { News } from '../hooks/use-news/use-news.types';

const getArticleURL = (news: News) => {
  if ('url' in news) return news.url;
  if ('link' in news) return news.link;
  return undefined;
};

export const formatNews = memoize((news: News) => {
  const title = 'en' in news ? news.en : news.title;
  let content = 'body' in news ? news.body : title;
  let author = 'body' in news ? title.replace(/ \(.+/, '') : '';

  const [match] = content.match(/- \w+$/) || [];
  if (match) {
    content = content.replace(match, '');
    author = match.replace('- ', '');
  }

  if (!author && content.includes(':')) {
    let rest;
    [author, ...rest] = content.split(':');
    content = rest.join(':').trim();
  }

  const displayedContent = content
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[(@.\S+)\]\(/, '$1')
    .replace(/Quote @/, '@');

  const link = getArticleURL(news);

  return {
    author,
    link,
    content: displayedContent,
    source: news.source || 'Twitter',
    time: news.time || Number(new Date()),
  };
});

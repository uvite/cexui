export enum NewsSources {
  TreeNews = 'TreeNews',
  NewsmakerPro = 'NewsmakerPro',
}

export type News = BlogNews | TGNews | TwitterNews;

export type TGNews = {
  id: string;
  title: string;
  source: string;
  body: string;
  time: number;
  link: string;
};

export type NewsWithSymbols = {
  id: string;
  news: {
    author: string;
    content: string;
    source: string;
    time: number;
    link?: string;
  };
  symbols: string[];
  receivedAt?: number;
};

export interface TwitterNews {
  title: string;
  source: string;
  body: string;
  time: number;
  type: string;
  link: string;
  info: Info;
  coin: string;
  tweet: string;
  actions: Action[];
}

export interface BlogNews {
  title: string;
  en: string;
  kr?: string;
  source: string;
  url: string;
  time: number;
  symbols: string[];
  _id: string;
  telegramMsgId?: number;
  firstPrice?: FirstPrice;
  percent1m?: Percent;
  percent5m?: Percent;
  percent1h?: Percent;
  actions?: Action[];
}

export interface FirstPrice {
  [coin: string]: number;
}

export interface Percent {
  [coin: string]: number;
}

export interface Action {
  action: string;
  title: string;
  icon: string;
}

export interface Info {
  twitterId: string;
  isReply: boolean;
  isRetweet: boolean;
  isQuote: boolean;
}

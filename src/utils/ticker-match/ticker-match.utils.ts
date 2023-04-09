import { uniq } from 'lodash';

import type { News } from '../../hooks/use-news/use-news.types';

import type {
  TickersWordsCommon,
  TickersWordsMapping,
} from './ticker-match.atoms';

export const tickerRegex = /10+|BUSD$|USDT$/g;

export const matchTickers =
  ({
    tickersWordsMapping,
    tickersWordsCommon,
    tickers,
  }: {
    tickersWordsMapping: TickersWordsMapping;
    tickersWordsCommon: TickersWordsCommon;
    tickers: string[];
  }) =>
  (message: News) => {
    const results: Array<string | undefined> = [];

    const usdtTickers = tickers.filter((t) => t.endsWith('USDT'));
    const busdTickers = tickers.filter((t) => t.endsWith('BUSD'));

    // first check if the message contains a coin
    if ('coin' in message) {
      results.push(message.coin);
    }

    // second check if the message contains symbols
    if ('symbols' in message) {
      results.push(...message.symbols.map((s) => s.replace(/_.+/, '')));
    }

    // third check the message content
    let text = typeof message.title === 'string' ? message.title : '';
    if ('body' in message) text = `${message.title} ${message.body}`;

    // uppercase everything
    text = text.toUpperCase();

    let words = text
      .split(
        / |:|-|\(|\)|,|'|‘|’|#|\.|\$|\?|!|\/|@|\n|\t|»|–|\||\\|\[|\]|>|<|！/gm
      ) // split message into words
      .filter((w) => w.length > 0 && !/^-?\d+$/.test(w)); // remove empty words and numbers

    // check our mapping for matches
    results.push(
      ...words.flatMap((w) => {
        const match = tickersWordsMapping[w];

        if (Array.isArray(match)) {
          return match.map(
            (m) =>
              usdtTickers.find((t) => t.replace(tickerRegex, '') === m) ||
              busdTickers.find((t) => t.replace(tickerRegex, '') === m)
          );
        }

        return match;
      })
    );

    // remove common words
    tickersWordsCommon.forEach((c) => {
      const symbol = c.toUpperCase();

      if (text.includes(symbol) && !text.includes(`$${symbol}`)) {
        words = words.filter((w) => w !== c.toUpperCase());
      }
    });

    // check existing tickers for matches in words
    results.push(
      ...words.flatMap(
        (w) =>
          usdtTickers.find((t) => t.replace(tickerRegex, '') === w) ||
          busdTickers.find((t) => t.replace(tickerRegex, '') === w)
      )
    );

    // remove duplicates and filter out non-tickers
    return uniq(results).filter((r) => r && tickers.includes(r)) as string[];
  };

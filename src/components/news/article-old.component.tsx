import cx from 'clsx';
import dayjs from 'dayjs';
import { useSetAtom } from 'jotai';
import React from 'react';
import type { Ticker } from 'safe-cex/dist/types';

import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import { tickerRegex } from '../../utils/ticker-match/ticker-match.utils';

export const ArticleOldComponent = ({
  news,
  tickers,
}: {
  news: {
    author?: string;
    content: string;
    link?: string;
    source: string;
    time: number | string;
  };
  tickers: Ticker[];
}) => {
  const setSelected = useSetAtom(selectedSymbolAtom);

  return (
    <div className="px-3 first:pt-4">
      <div className="flex items-center">
        <div className="w-[calc(100%-65px)] break-words pr-4">
          <div className="font-bold">
            {news.author && (
              <div className="mb-1 font-bold uppercase text-pink-300">{news.author}</div>
            )}
            <span className="text-dark-text-white text-sm font-medium tracking-wider">
              {news.content}
            </span>
          </div>
          <div className="text-dark-border-gray-2 mt-2 flex text-xs">
            <a
              className="uppercase hover:underline"
              href={news.link}
              target="_blank"
              rel="noreferrer"
            >
              Link [{news.source}]
            </a>
            <span className="ml-auto text-right">{dayjs(news.time).format('MM-DD HH:mm:ss')}</span>
          </div>
        </div>
        <div className="flex-1 shrink-0">
          {!tickers.length && (
            <div className="border-dark-border-gray ml-auto h-[60px] w-[60px] flex-shrink-0 rounded-md border text-center">
              <div className="flex h-full w-full items-center justify-center opacity-30">?</div>
            </div>
          )}
          {tickers.map((ticker) => (
            <div
              key={ticker.symbol}
              className="border-dark-border-gray mb-2 ml-auto h-[60px] w-[60px] flex-shrink-0 rounded-md border text-center last:mb-0"
            >
              <div
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                onClick={() => setSelected(ticker.symbol)}
              >
                <div className="font-mono text-sm font-bold">
                  {ticker.symbol.replace(tickerRegex, '')}
                </div>
                <div
                  className={cx('font-mono text-[10px]', {
                    'text-dark-green': ticker.percentage >= 0,
                    'text-red-500': ticker.percentage < 0,
                  })}
                >
                  {ticker.percentage < 0 ? '-' : '+'}
                  {Math.round(Math.abs(ticker.percentage) * 100) / 100}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-dark-bg my-4 h-[1px] w-full" />
    </div>
  );
};

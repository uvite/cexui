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
              <div className="text-pink-300 font-bold uppercase mb-1">
                {news.author}
              </div>
            )}
            <span className="text-sm font-medium text-dark-text-white tracking-wider">
              {news.content}
            </span>
          </div>
          <div className="flex text-xs text-dark-border-gray-2 mt-2">
            <a
              className="uppercase hover:underline"
              href={news.link}
              target="_blank"
              rel="noreferrer"
            >
              Link [{news.source}]
            </a>
            <span className="ml-auto text-right">
              {dayjs(news.time).format('MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>
        <div className="flex-1 shrink-0">
          {!tickers.length && (
            <div className="rounded-md border border-dark-border-gray ml-auto flex-shrink-0 w-[60px] h-[60px] text-center">
              <div className="flex items-center justify-center h-full w-full opacity-30">
                ?
              </div>
            </div>
          )}
          {tickers.map((ticker) => (
            <div
              key={ticker.symbol}
              className="rounded-md border border-dark-border-gray ml-auto flex-shrink-0 w-[60px] h-[60px] text-center mb-2 last:mb-0"
            >
              <div
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                onClick={() => setSelected(ticker.symbol)}
              >
                <div className="text-sm font-bold font-mono">
                  {ticker.symbol.replace(tickerRegex, '')}
                </div>
                <div
                  className={cx('text-[10px] font-mono', {
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
      <div className="w-full my-4 h-[1px] bg-dark-bg" />
    </div>
  );
};

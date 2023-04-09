import cx from 'clsx';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import { take } from 'lodash';
import React, { memo } from 'react';
import { AiOutlineInbox, AiOutlineSend } from 'react-icons/ai';
import type { Ticker } from 'safe-cex/dist/types';

import {
  newsDefaultTickersAtom,
  newsOldLayoutAtom,
  selectedNewsAtom,
} from '../../hooks/trade/use-news-trade.hooks';
import { orderedTickersAtom } from '../../hooks/use-tickers.hooks';

import { ApeButtonsComponent } from './ape-buttons.component';
import { ArticleOldComponent } from './article-old.component';

type ArticleComponentProps = {
  id: string;
  author: string;
  content: string;
  source: string;
  symbols: string[];
  time: number | string;
  link?: string;
  receivedAt?: number;
  selected?: boolean;
};

export const ArticleComponent = memo((props: ArticleComponentProps) => {
  const setSelected = useSetAtom(selectedNewsAtom);

  const oldLayout = useAtomValue(newsOldLayoutAtom);
  const exchangeTickers = useAtomValue(orderedTickersAtom);
  const defaultTickers = useAtomValue(newsDefaultTickersAtom);

  const matchedTickers =
    props.symbols.length > 0 ? props.symbols : defaultTickers;

  const tickers = take(
    matchedTickers
      .map((s) => exchangeTickers.find((t) => t.symbol === s))
      .filter((t) => t) as Ticker[],
    3
  );

  if (oldLayout) {
    return <ArticleOldComponent news={props} tickers={tickers} />;
  }

  return (
    <div className="px-1 py-1" onClick={() => setSelected(props.id)}>
      <div
        className={cx(
          'border-2 rounded-md p-2 bg-dark-bg-2',
          props.selected ? 'border-dark-blue' : 'border-dark-border-gray'
        )}
      >
        <div className="break-words">
          {props.author && (
            <div className="text-pink-300 font-bold uppercase mb-1">
              {props.author}
            </div>
          )}
          <span className="text-sm font-medium text-dark-text-white tracking-wider">
            {props.content}
          </span>
        </div>
        <div className="flex text-[10px] text-dark-border-gray-2 mt-2">
          <a
            className="uppercase hover:underline"
            href={props.link}
            target="_blank"
            rel="noreferrer"
          >
            Link [{props.source}]
          </a>
          <div className="ml-auto font-mono text-right">
            <div className="flex items-center">
              <AiOutlineSend className="mr-2" />
              <div>{dayjs(props.time).format('hh:mm:ss.SSS A')}</div>
            </div>
            {props.receivedAt && (
              <div className="flex items-center">
                <AiOutlineInbox className="mr-2" />
                <div>{dayjs(props.receivedAt).format('hh:mm:ss.SSS A')}</div>
              </div>
            )}
          </div>
        </div>
        {tickers.length > 0 && (
          <div className="mt-2">
            {tickers.map((ticker, idx) => (
              <ApeButtonsComponent
                key={ticker.symbol}
                ticker={ticker}
                selected={props.selected && idx === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

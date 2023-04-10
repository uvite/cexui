import useSize from '@react-hook/size';
import cx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useRef } from 'react';
import type { Ticker } from 'safe-cex/dist/types';
import { OrderSide } from 'safe-cex/dist/types';

import { marketsAtom } from '../../app-state';
import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import {
  newsTradeShortcutsEnabledAtom,
  useTickerTradeSizeMap,
} from '../../hooks/trade/use-news-trade.hooks';
import { useApeNews } from '../../hooks/use-ape-news.hooks';
import { useKeyBindings } from '../../hooks/use-keybindings.hooks';
import { shortcutsAtom } from '../../hooks/use-shortcuts.hooks';
import { afterDecimal } from '../../utils/after-decimal.utils';
import { tickerRegex } from '../../utils/ticker-match/ticker-match.utils';
import { getTokenURL } from '../../utils/token-image.utils';
import { OrderSideButton } from '../ui/order-side-button.component';

export const ApeButtonsComponent = ({
  ticker,
  selected,
}: {
  ticker: Ticker;
  selected?: boolean;
}) => {
  const el = useRef(null);
  const w = useSize(el)[0];
  const lg = w > 330;

  const setSelected = useSetAtom(selectedSymbolAtom);

  const markets = useAtomValue(marketsAtom);
  const market = markets.find((m) => m.symbol === ticker.symbol);

  const [size, setSize] = useTickerTradeSizeMap(ticker.symbol);

  const shortcuts = useAtomValue(shortcutsAtom);
  const shortcutsEnabled = useAtomValue(newsTradeShortcutsEnabledAtom);

  const apeNews = useApeNews();

  useKeyBindings(
    [
      {
        keys: shortcuts.buyNews,
        onEvent: (event) => {
          event.preventDefault();
          apeNews({ side: OrderSide.Buy, symbol: ticker.symbol });
        },
      },
      {
        keys: shortcuts.sellNews,
        onEvent: (event) => {
          event.preventDefault();
          apeNews({ side: OrderSide.Sell, symbol: ticker.symbol });
        },
      },
    ],
    selected && shortcutsEnabled,
  );

  return (
    <div ref={el} className="mt-1 flex select-none items-center first:mt-0">
      <div
        className={cx(
          'mr-2 h-[12px] w-[12px] overflow-hidden rounded-full',
          lg ? 'block' : 'hidden',
        )}
      >
        <img alt={ticker.symbol} height={16} width={16} src={getTokenURL(ticker.symbol)} />
      </div>
      <div
        className="flex w-[30px] cursor-pointer items-center"
        onClick={() => setSelected(ticker.symbol)}
      >
        <div className="font-mono text-xs font-semibold">
          {ticker.symbol.replace(tickerRegex, '')}
        </div>
      </div>
      <div
        className="flex-1 cursor-pointer text-center text-[10px]"
        onClick={() => setSelected(ticker.symbol)}
      >
        <div className="font-mono font-bold">
          ${ticker.last.toFixed(afterDecimal(market?.precision?.price || ticker.last))}
        </div>
        <div>
          <span
            className={cx(
              'font-mono font-semibold',
              ticker.percentage < 0 ? 'text-red-500' : 'text-dark-green',
            )}
          >
            {ticker.percentage < 0 ? '-' : '+'}
            {(Math.round(Math.abs(ticker.percentage) * 100) / 100).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="ml-auto flex items-center">
        <div className="mr-4">
          <span className="mr-1 font-bold">$</span>
          <input
            className="w-[65px] text-right font-mono text-xs font-semibold"
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <OrderSideButton
          className="h-100 mr-2 text-sm"
          selected={true}
          side={OrderSide.Buy}
          label={lg ? 'BUY' : 'B'}
          onClick={() => apeNews({ side: OrderSide.Buy, symbol: ticker.symbol })}
        />
        <OrderSideButton
          className="h-100 text-sm"
          selected={true}
          side={OrderSide.Sell}
          label={lg ? 'SELL' : 'S'}
          onClick={() => apeNews({ side: OrderSide.Sell, symbol: ticker.symbol })}
        />
      </div>
    </div>
  );
};

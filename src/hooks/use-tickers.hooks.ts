import { atom, useAtomValue } from 'jotai';
import { orderBy } from 'lodash';
import type { Ticker } from 'safe-cex/dist/types';

import { tickersAtom } from '../app-state';

import { favoriteSymbolsAtom } from './use-favorites.hooks';

type OrderByTickers = keyof Ticker;
type OrderDirectionTickers = 'asc' | 'desc';

export const _orderByTickersAtom =
  atom<`${OrderByTickers}:${OrderDirectionTickers}`>('symbol:asc');

export const orderByTickersAtom = atom(
  (get) =>
    get(_orderByTickersAtom).split(':') as [
      OrderByTickers,
      OrderDirectionTickers
    ]
);

export const orderTickersFnAtom = atom(
  null,
  (get, set, orderByAttr: OrderByTickers) => {
    const [currOrderByAttr, orderDirection] = get(orderByTickersAtom);

    if (currOrderByAttr === orderByAttr) {
      set(
        _orderByTickersAtom,
        `${currOrderByAttr}:${orderDirection === 'asc' ? 'desc' : 'asc'}`
      );
    } else {
      set(_orderByTickersAtom, `${orderByAttr}:asc`);
    }
  }
);

export const orderedTickersAtom = atom((get) => {
  const tickers = get(tickersAtom);
  const [orderByAttr, orderDirection] = get(orderByTickersAtom);

  return orderBy(tickers, [orderByAttr], [orderDirection]);
});

export const useTickers = () => useAtomValue(orderedTickersAtom);

export const useGetTickerInfos = () => {
  const tickers = useAtomValue(tickersAtom);
  return (symbol: string) => tickers.find((s) => s.symbol === symbol);
};

export const useTickerInfos = (ticker: string) => {
  return useGetTickerInfos()(ticker);
};

export const filterAtom = atom('');
export const displayedTickersAtom = atom((get) => {
  const tickers = get(orderedTickersAtom);
  const filter = get(filterAtom);
  const favorites = get(favoriteSymbolsAtom);

  const filtered = tickers.filter((ticker) =>
    ticker.symbol
      .replace(/\/.+/, '')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const ordered = orderBy(
    filtered,
    [(ticker) => favorites.includes(ticker.symbol)],
    ['desc']
  );

  return ordered;
});

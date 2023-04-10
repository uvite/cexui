import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { defaultStore } from 'safe-cex/dist/store';
import type { Store } from 'safe-cex/dist/types';

import { selectedSymbolAtom } from './atoms/trade.atoms';

export const appState: Store = JSON.parse(JSON.stringify(defaultStore));

export const appStateAtom = atom({ ...appState });
export const loadedAtom = focusAtom(appStateAtom, (o) => o.prop('loaded'));
export const latencyAtom = focusAtom(appStateAtom, (o) => o.prop('latency'));
export const balanceAtom = focusAtom(appStateAtom, (o) => o.prop('balance'));
export const tickersAtom = focusAtom(appStateAtom, (o) => o.prop('tickers'));
export const marketsAtom = focusAtom(appStateAtom, (o) => o.prop('markets'));
export const ordersAtom = focusAtom(appStateAtom, (o) => o.prop('orders'));
export const optionsAtom = focusAtom(appStateAtom, (o) => o.prop('options'));
export const positionsAtom = focusAtom(appStateAtom, (o) => o.prop('positions'));

export const selectedAtom = atom((get) => {
  const app = get(appStateAtom);
  const selected = get(selectedSymbolAtom);

  const market = app.markets.find((m) => m.symbol === selected);
  const ticker = app.tickers.find((t) => t.symbol === selected);
  const positions = app.positions.filter((p) => p.symbol === selected);
  const orders = app.orders.filter((o) => o.symbol === selected);

  return { symbol: selected, market, ticker, positions, orders };
});

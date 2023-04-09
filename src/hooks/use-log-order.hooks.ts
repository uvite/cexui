import { useSetAtom } from 'jotai';
import type { PlaceOrderOpts } from 'safe-cex/dist/types';
import { OrderType } from 'safe-cex/dist/types';

import { tickerRegex } from '../utils/ticker-match/ticker-match.utils';

import { logsAtom } from './use-logs.hooks';

export const useLogOrder = () => {
  const log = useSetAtom(logsAtom);

  return (order: PlaceOrderOpts) => {
    const side = order.side.toUpperCase();
    const symbol = order.symbol.replace(tickerRegex, '');
    const price = order.type === OrderType.Market ? 'MARKET' : order.price;
    log(`[USER] Place order - ${side} ${symbol} ${order.amount} @ ${price}`);
  };
};

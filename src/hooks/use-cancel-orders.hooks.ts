import { useSetAtom } from 'jotai';
import { useContext } from 'react';
import type { Order } from 'safe-cex/dist/types';

import { EventName, useAnalytics } from './use-analytics.hooks';
import { ConnectorContext } from './use-exchange-connector.hooks';
import { logsAtom } from './use-logs.hooks';

export const useCancelOrders = () => {
  const track = useAnalytics();
  const connector = useContext(ConnectorContext);
  const log = useSetAtom(logsAtom);

  return async (orders: Order[]) => {
    log(`[USER] Cancel ${orders.length} order(s)`);

    orders.forEach((order) =>
      track(EventName.CancelOrder, {
        symbol: order.symbol,
        side: order.side,
        price: order.price,
        amount: order.amount,
      }),
    );

    await connector?.cancelOrders?.(orders);
  };
};

export const useCancelAllOrders = () => {
  const track = useAnalytics();
  const connector = useContext(ConnectorContext);
  const log = useSetAtom(logsAtom);

  return async (symbol?: string) => {
    if (symbol) {
      log(`[USER] Cancel all ${symbol} orders`);
      track(EventName.CancelSymbolOrders, { symbol });
      await connector?.cancelSymbolOrders(symbol);
    } else {
      log(`[USER] Cancel all orders`);
      track(EventName.CancelAllOrders, undefined);
      await connector?.cancelAllOrders();
    }
  };
};

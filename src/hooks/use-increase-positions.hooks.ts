import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import type { Position } from 'safe-cex/dist/types';
import { OrderSide, OrderType } from 'safe-cex/dist/types';

import { tickersAtom } from '../app-state';

import { EventName, useAnalytics } from './use-analytics.hooks';
import { usePlaceOrders } from './use-place-orders.hooks';

export const useIncreasePositions = () => {
  const track = useAnalytics();

  const placeOrders = usePlaceOrders();
  const tickers = useAtomValue(tickersAtom);

  const increasePositions = useCallback(
    async ({ positions, factor = 1 }: { positions: Position[]; factor?: number }) => {
      const ordersAndTrackEvents = positions.map((position) => {
        const ticker = tickers.find((t) => t.symbol === position.symbol);

        if (!ticker) {
          // should not happen, but just in case
          throw new Error(`Ticker for ${position.symbol} not found`);
        }

        const price = ticker.last;
        const side = position.side === 'long' ? OrderSide.Buy : OrderSide.Sell;
        const amount = position.contracts * factor;

        const event = {
          from: 'increase_positions',
          order: {
            symbol: position.symbol,
            side,
            amount,
            price,
          },
        };

        const order = {
          symbol: position.symbol,
          amount,
          side,
          price,
          type: OrderType.Limit,
        };

        return { event, order };
      });

      const orderIds = await placeOrders(ordersAndTrackEvents.map((o) => o.order));

      if (orderIds.length > 0) {
        ordersAndTrackEvents.forEach(({ event }) => {
          track(EventName.Trade, event);
        });
      }
    },
    [placeOrders, tickers, track],
  );

  return increasePositions;
};

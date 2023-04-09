import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import type { Position } from 'safe-cex/dist/types';
import { OrderType, OrderSide } from 'safe-cex/dist/types';

import { tickersAtom } from '../app-state';

import { EventName, useAnalytics } from './use-analytics.hooks';
import { usePlaceOrders } from './use-place-orders.hooks';

const inverseSide = {
  long: OrderSide.Sell,
  short: OrderSide.Buy,
};

export const useReducePositions = () => {
  const track = useAnalytics();
  const placeOrders = usePlaceOrders();
  const tickers = useAtomValue(tickersAtom);

  const reducePositions = useCallback(
    async ({
      positions,
      factor = 1,
      hedge = false,
      forceMarket = false,
    }: {
      positions: Position[];
      factor?: number;
      hedge?: boolean;
      forceMarket?: boolean;
    }) => {
      const ordersAndTrackEvents = positions.map((position) => {
        const ticker = tickers.find((t) => t.symbol === position.symbol);

        if (!ticker) {
          // should not happen, but just in case
          throw new Error(`Ticker for ${position.symbol} not found`);
        }

        const price = ticker.last;
        const side = inverseSide[position.side];
        const amount = position.contracts * factor;
        const reduceOnly = !hedge;

        const event = {
          from: 'reduce_positions',
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
          type: forceMarket ? OrderType.Market : OrderType.Limit,
          price,
          reduceOnly,
        };

        return { order, event };
      });

      const orderIds = await placeOrders(
        ordersAndTrackEvents.map((o) => o.order)
      );

      if (orderIds.length > 0) {
        ordersAndTrackEvents.forEach(({ event }) => {
          track(EventName.Trade, event);
        });
      }
    },
    [placeOrders, tickers, track]
  );

  return reducePositions;
};

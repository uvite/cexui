import { useAtomValue } from 'jotai';
import { useContext } from 'react';
import type { PlaceOrderOpts } from 'safe-cex/dist/types';

import { fatFingerValueAtom } from '../atoms/trade.atoms';
import { fatFingerError } from '../utils/errors.utils';

import { ConnectorContext } from './use-exchange-connector.hooks';
import { useLogOrder } from './use-log-order.hooks';
import { useGetTickerPrice } from './use-ticker-price.hooks';

export const usePlaceOrders = () => {
  const getTickerPrice = useGetTickerPrice();
  const connector = useContext(ConnectorContext);

  const logOrder = useLogOrder();
  const fatFinger = useAtomValue(fatFingerValueAtom);

  return async (
    input: Array<Omit<PlaceOrderOpts, 'price'> & { price?: number }>
  ) => {
    if (connector?.placeOrders) {
      const orders = input.map((opts) => {
        const price = opts.price || getTickerPrice(opts.symbol, opts.side);
        return { ...opts, price };
      });

      const totalSize = orders.reduce(
        (acc, order) => acc + order.price * order.amount,
        0
      );

      if (fatFinger && totalSize > fatFinger) {
        fatFingerError();
        return [];
      }

      orders.forEach(logOrder);
      const orderIds = await connector.placeOrders(orders);

      return orderIds;
    }

    return [];
  };
};

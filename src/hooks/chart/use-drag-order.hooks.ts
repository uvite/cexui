import type { IChartApi } from '@iam4x/lightweight-charts';
import { useAtomValue } from 'jotai';
import { useCallback, useContext, useEffect, useRef } from 'react';

import { marketsAtom, ordersAtom } from '../../app-state';
import { errorToast } from '../../notifications/error.toast';
import { updatedOrderToast } from '../../notifications/updated-order.toast';
import { floorStep } from '../../utils/floor-step.utils';
import { ConnectorContext } from '../use-exchange-connector.hooks';

import type { PriceLine } from './chart.types';

export const useDragOrders = ({ chart }: { chart?: IChartApi }) => {
  const isSubscribed = useRef(false);
  const exchange = useContext(ConnectorContext);

  const orders = useAtomValue(ordersAtom);
  const markets = useAtomValue(marketsAtom);

  const handler = useCallback(
    async (params: { customPriceLine: PriceLine }) => {
      const opts = params.customPriceLine.options();

      const order = orders.find((o) => o.id === opts.id);
      const market = order && markets.find((m) => m.symbol === order?.symbol);

      if (exchange && order && market) {
        const pPrice = market.precision.price;
        const price = floorStep(opts.price, pPrice);

        if (price !== order.price) {
          try {
            await exchange.updateOrder({ order, update: { price } });
            updatedOrderToast({ order, update: { price } });
          } catch (err: any) {
            errorToast(err.message);
          }
        }
      }
    },
    [exchange, markets, orders]
  );

  useEffect(() => {
    if (chart && !isSubscribed.current) {
      isSubscribed.current = true;
      chart.subscribeCustomPriceLineDragged(handler);
    }

    return () => {
      if (isSubscribed.current) {
        isSubscribed.current = false;
        chart?.unsubscribeCustomPriceLineDragged(handler);
      }
    };
  }, [chart, handler]);
};

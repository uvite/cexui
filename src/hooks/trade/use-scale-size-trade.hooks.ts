import { atom, useAtomValue } from 'jotai';
import { mean } from 'lodash';
import { OrderType } from 'safe-cex/dist/types';

import {
  tradeEntryTouchedAtom,
  nbOrdersAtom,
  priceScaleRatioAtom,
  tradeSideAtom,
  selectedSymbolAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
  tradeSizeAtom,
} from '../../atoms/trade.atoms';
import { easeRange } from '../../utils/ease-range.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { generatePriceRange } from '../../utils/price-range.utils';
import { EventName, useAnalytics } from '../use-analytics.hooks';
import { usePlaceOrders } from '../use-place-orders.hooks';
import { selectedSymbolSidePriceAtom } from '../use-ticker-price.hooks';

export const scaleFromAtom = atom('');
export const scaleToAtom = atom('');
export const scaleSizeReduceOnlyAtom = atom(false);

export const fromOrCurrentPriceAtom = atom((get) => {
  const from = get(scaleFromAtom);
  const entryTouched = get(tradeEntryTouchedAtom);
  const symbolPrice = get(selectedSymbolSidePriceAtom);

  return entryTouched ? from : symbolPrice;
});

export const scaleInSizeAtom = atom((get) => {
  const from = pFloat(get(fromOrCurrentPriceAtom));
  const to = pFloat(get(scaleToAtom));
  const size = pFloat(get(tradeSizeAtom));
  const nbOrders = get(nbOrdersAtom);
  const easeRatio = get(priceScaleRatioAtom);
  const side = get(tradeSideAtom);
  const stopLoss = get(tradeStopLossAtom);
  const takeProfit = get(tradeTakeProfitAtom);
  const reduceOnly = get(scaleSizeReduceOnlyAtom);

  const priceRange = generatePriceRange({ from, to, nbOrders });
  const priceRangeEased = easeRange(priceRange, easeRatio);

  const avgPrice = mean(priceRangeEased);
  const sizeInUSD = size * avgPrice;

  const estLoss = stopLoss ? (avgPrice - pFloat(stopLoss)) * size : 0;
  const estProfit = takeProfit ? (pFloat(takeProfit) - avgPrice) * size : 0;

  const orders: Array<{
    size: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
    reduceOnly?: boolean;
  }> = priceRangeEased.map((price) => ({
    size: pFloat(size) / pFloat(nbOrders),
    price: pFloat(price),
    reduceOnly,
  }));

  if (stopLoss && orders.length && !reduceOnly) {
    orders[0].stopLoss = pFloat(stopLoss);
  }

  if (takeProfit && orders.length && !reduceOnly) {
    orders[0].takeProfit = pFloat(takeProfit);
  }

  return {
    side,
    orders,
    from,
    to,
    stopLoss,
    takeProfit,
    size,
    avgPrice: avgPrice || 0,
    sizeInUSD: sizeInUSD || 0,
    estLoss,
    estProfit,
  };
});

export const useScaledInSizeTrade = () => {
  const track = useAnalytics();
  const placeOrders = usePlaceOrders();

  const symbol = useAtomValue(selectedSymbolAtom);
  const { orders, side, size, avgPrice, stopLoss, takeProfit } = useAtomValue(scaleInSizeAtom);

  const scaleIn = async () => {
    const orderIds = await placeOrders(
      orders.map((order) => ({
        side,
        symbol,
        price: order.price,
        type: OrderType.Limit,
        amount: order.size,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
        reduceOnly: order.reduceOnly,
      })),
    );

    if (orderIds.length > 0) {
      track(EventName.Trade, {
        from: 'scaled_in_size',
        order: {
          symbol,
          side,
          amount: size,
          price: avgPrice,
          takeProfit: takeProfit ? pFloat(takeProfit) : undefined,
          stopLoss: stopLoss ? pFloat(stopLoss) : undefined,
          reduceOnly: orders[0].reduceOnly,
        },
      });
    }
  };

  return scaleIn;
};

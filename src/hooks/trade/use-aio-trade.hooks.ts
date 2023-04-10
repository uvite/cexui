import { atom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { maxBy, mean, minBy } from 'lodash';
import { useContext } from 'react';
import type { PlaceOrderOpts } from 'safe-cex/dist/types';
import { OrderSide, OrderType } from 'safe-cex/dist/types';

import { selectedAtom } from '../../app-state';
import {
  fatFingerValueAtom,
  selectedSymbolAtom,
  tradeSideAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
} from '../../atoms/trade.atoms';
import { fatFingerError } from '../../utils/errors.utils';
import { floorStep } from '../../utils/floor-step.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { generatePriceRange } from '../../utils/price-range.utils';
import { EventName, useAnalytics } from '../use-analytics.hooks';
import { ConnectorContext } from '../use-exchange-connector.hooks';

type AIOTradeSize = { value: number; label: string };
type AIOOrderType = { value: 'market' | 'scale'; label: string };

type AIOOrderSubType = {
  [key in AIOOrderType['value']]: Array<{
    value: number | string;
    label: string;
  }>;
};

export const aioTradesSizesAtom = atomWithStorage<AIOTradeSize[]>('aioTradeSizes', [
  { value: 1000, label: '$1,000' },
  { value: 2500, label: '$2,500' },
  { value: 5000, label: '$5,000' },
  { value: 10000, label: '$10,000' },
]);

export const aioOrderTypes: AIOOrderType[] = [
  { value: 'market', label: 'Market' },
  { value: 'scale', label: 'Scale' },
  // { value: 'twap', label: 'TWAP' },
];

export const aioOrderSubTypes: AIOOrderSubType = {
  market: [
    { value: 'market', label: 'Last price' },
    { value: 'best_bidask', label: 'Best bid/ask' },
  ],
  scale: [
    { value: 0.5, label: '0.5%' },
    { value: 1, label: '1%' },
    { value: 2, label: '2%' },
    { value: 5, label: '5%' },
  ],
  // twap: [
  //   { value: 5, label: '5m' },
  //   { value: 10, label: '10m' },
  //   { value: 15, label: '15m' },
  //   { value: 30, label: '30m' },
  // ],
};

export const _aioSelectedSizeAtom = atomWithStorage('aioSelectedSize', 1000);
export const aioSelectedSizeAtom = atom(
  (get) => {
    const selectedSize = get(_aioSelectedSizeAtom);
    const sizes = get(aioTradesSizesAtom);

    return sizes.find((size) => size.value === selectedSize) ? selectedSize : sizes[0].value;
  },
  (_get, set, value: AIOTradeSize['value']) => {
    set(_aioSelectedSizeAtom, value);
  },
);

export const _aioSelectedOrderTypeAtom = atomWithStorage(
  'aioSelectedOrderType',
  aioOrderTypes[0].value,
);

export const _aioSelectedOrderSubTypeAtom = atomWithStorage<number | string>(
  'aioSelectedOrderSubType',
  aioOrderSubTypes.market[0].value,
);

export const aioSelectedOrderTypeAtom = atom(
  (get) => {
    const selectedOrderType = get(_aioSelectedOrderTypeAtom);

    return aioOrderTypes.find(({ value }) => value === selectedOrderType)
      ? selectedOrderType
      : aioOrderTypes[0].value;
  },
  (_get, set, value: AIOOrderType['value']) => {
    const subOrderType = aioOrderSubTypes[value][0].value;

    set(_aioSelectedOrderTypeAtom, value);
    set(_aioSelectedOrderSubTypeAtom, subOrderType);
  },
);

export const aioSelectedOrderSubTypeAtom = atom(
  (get) => {
    const selectedOrderType = get(_aioSelectedOrderTypeAtom);
    const selectedOrderSubType = get(_aioSelectedOrderSubTypeAtom);

    const exist = aioOrderSubTypes[selectedOrderType].find(
      ({ value }) => value === selectedOrderSubType,
    );

    return exist ? selectedOrderSubType : aioOrderSubTypes[selectedOrderType][0].value;
  },
  (_get, set, value: number | string) => {
    set(_aioSelectedOrderSubTypeAtom, value);
  },
);

// eslint-disable-next-line complexity
export const aioTradeAtom = atom((get) => {
  const size = get(aioSelectedSizeAtom);
  const side = get(tradeSideAtom);
  const stop = get(tradeStopLossAtom);
  const takeProfit = get(tradeTakeProfitAtom);

  const orderType = get(aioSelectedOrderTypeAtom);
  const orderSubType = get(aioSelectedOrderSubTypeAtom);

  const symbol = get(selectedSymbolAtom);

  const { ticker, market } = get(selectedAtom);

  const totalQuantity = floorStep(size / (ticker?.last ?? 0), market?.precision?.amount ?? 0);

  let price = ticker ? ticker.last! : 0;
  const bestBid = ticker ? ticker.bid : 0;
  const bestAsk = ticker ? ticker.ask : 0;
  const bestPrice = side === OrderSide.Buy ? bestAsk : bestBid;

  const orders: PlaceOrderOpts[] = [];

  if (orderType === 'market') {
    if (orderSubType === 'best_bidask' && bestPrice) {
      price = bestPrice;
    }

    orders.push({
      side,
      symbol,
      price: bestPrice,
      amount: totalQuantity,
      type: orderSubType === 'best_bidask' ? OrderType.Limit : OrderType.Market,
    });
  }

  if (orderType === 'scale') {
    const from = ticker ? ticker.last! : 0;

    const percent = from * (pFloat(orderSubType) / 100);
    const to = side === OrderSide.Buy ? from - percent : from + percent;

    const nbOrders = 5;
    const priceRange = generatePriceRange({ from, to, nbOrders });

    price = mean(priceRange);

    orders.push(
      ...priceRange.map((orderPrice) => ({
        side,
        symbol,
        price: orderPrice,
        amount: floorStep(totalQuantity / nbOrders, market?.precision?.amount || 0),
        type: OrderType.Limit,
      })),
    );

    const entryOrder = side === OrderSide.Buy ? maxBy(orders, 'price') : minBy(orders, 'price');

    if (entryOrder) {
      entryOrder.price = bestPrice;
      entryOrder.type = OrderType.Limit;
    }
  }

  if (stop && orders.length) {
    orders[0].stopLoss = pFloat(stop);
  }

  if (takeProfit && orders.length) {
    orders[0].takeProfit = pFloat(takeProfit);
  }

  const estimatedLoss = stop ? (price - pFloat(stop)) * totalQuantity : 0;
  const estimatedProfit = takeProfit ? (pFloat(takeProfit) - price) * totalQuantity : 0;

  const isValidStop =
    (side === OrderSide.Buy ? price > pFloat(stop) : price < pFloat(stop)) || !stop;

  const isValidTakeProfit =
    (side === OrderSide.Buy ? price < pFloat(takeProfit) : price > pFloat(takeProfit)) ||
    !takeProfit;

  const isValid = isValidStop && isValidTakeProfit;

  return {
    price,
    side,
    stop,
    takeProfit,
    orders,
    symbol,
    orderType,
    orderSubType,
    totalQuantity: isValid ? totalQuantity : 0,
    estimatedLoss: (isValid && (side === OrderSide.Sell ? estimatedLoss : -estimatedLoss)) || 0,
    estimatedProfit:
      (isValid && (side === OrderSide.Buy ? estimatedProfit : -estimatedProfit)) || 0,
  };
});

export const useAIOTrade = () => {
  const track = useAnalytics();

  const connector = useContext(ConnectorContext);
  const opts = useAtomValue(aioTradeAtom);
  const fatFinger = useAtomValue(fatFingerValueAtom);

  const trade = async () => {
    if (opts.orders.length > 0 && connector) {
      const totalSize = opts.orders.reduce(
        (acc, order) => acc + (order.price ?? 0) * order.amount,
        0,
      );

      if (fatFinger && totalSize > fatFinger) {
        fatFingerError();
        return;
      }

      const orderIds = await connector.placeOrders(opts.orders);

      if (orderIds.length > 0) {
        track(EventName.Trade, {
          from: `all_in_one__${opts.orderType}`,
          order: {
            symbol: opts.symbol,
            side: opts.side,
            price: opts.price,
            amount: opts.totalQuantity,
            stopLoss: opts.stop ? pFloat(opts.stop) : undefined,
            takeProfit: opts.takeProfit ? pFloat(opts.takeProfit) : undefined,
          },
        });
      }
    }
  };

  return trade;
};

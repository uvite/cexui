import { atom, useAtomValue } from 'jotai';
import { mean } from 'lodash';
import { OrderSide, OrderType } from 'safe-cex/dist/types';

import { balanceAtom, selectedAtom } from '../../app-state';
import {
  tradeSideAtom,
  priceScaleRatioAtom,
  nbOrdersAtom,
  selectedSymbolAtom,
  riskAtom,
  tradeTakeProfitAtom,
  tradeStopLossAtom,
  tradeEntryOrCurrentPriceAtom,
  quantityScaledAtom,
} from '../../atoms/trade.atoms';
import { easeRange } from '../../utils/ease-range.utils';
import { floorStep } from '../../utils/floor-step.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { generatePriceRange } from '../../utils/price-range.utils';
import { EventName, useAnalytics } from '../use-analytics.hooks';
import { usePlaceOrders } from '../use-place-orders.hooks';

const takerFees = 0.006;
const makerFees = 0.06;

export const scaledInRiskTradeAtom = atom((get) => {
  const balance = get(balanceAtom);

  const { market } = get(selectedAtom);

  const qtyStepSize = market?.precision?.amount ?? 0;
  const tickSize = market?.precision?.price ?? 0;

  const side = get(tradeSideAtom);
  const risk = get(riskAtom);
  const takeProfit = get(tradeTakeProfitAtom);
  const scaleRatio = get(quantityScaledAtom);
  const easeRatio = get(priceScaleRatioAtom);
  const nbOrders = get(nbOrdersAtom);

  const from = pFloat(get(tradeEntryOrCurrentPriceAtom));
  const stop = pFloat(get(tradeStopLossAtom));

  const lot = (Math.max(from, stop) - Math.min(from, stop)) / nbOrders;
  const to = from > stop ? stop + lot : stop - lot;

  const priceRange = generatePriceRange({ from, to, nbOrders });
  const priceRangeEased = easeRange(priceRange, easeRatio);

  const scaleAvgPrice = mean(priceRangeEased);
  const avgPrice = 1 / ((1 - scaleRatio) / from + scaleRatio / scaleAvgPrice);

  const riskWithFees = risk - takerFees - makerFees;
  const riskInUSD = balance.total * (riskWithFees / 100);

  const priceDiff = side === OrderSide.Buy ? avgPrice - stop : stop - avgPrice;
  const totalSize = riskInUSD / priceDiff;

  const rawEntrySize = totalSize * (1 - scaleRatio);
  const rawScaleSize = totalSize * scaleRatio;

  const entryQty = floorStep(rawEntrySize, qtyStepSize);
  const scaledInQty = floorStep(rawScaleSize, qtyStepSize);
  const totalQty = floorStep(totalSize, qtyStepSize);

  const scaledOrdersCount = entryQty ? nbOrders - 1 : nbOrders;
  const scaledSize = scaledInQty / scaledOrdersCount;

  const orders: Array<{
    size: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
  }> = priceRangeEased.map((price, idx) => ({
    size: floorStep(scaledSize, qtyStepSize),
    price: floorStep(price, tickSize),
    stopLoss: idx === 0 ? stop : undefined,
  }));

  if (entryQty > 0) {
    orders[0].size = entryQty;
  }

  if (takeProfit && orders.length) {
    orders[0].takeProfit = pFloat(takeProfit);
  }

  return {
    entryQty: (entryQty || orders[0].size) > 0 ? entryQty || orders[0].size : 0,
    scaledInQty: scaledInQty > 0 ? scaledInQty : 0,
    totalQty: totalQty > 0 ? totalQty : 0,
    avgPrice,
    riskInUSD,
    risk,
    orders,
    side,
    stop,
    takeProfit,
  };
});

export const useScaledInRiskTrade = () => {
  const track = useAnalytics();
  const placeOrders = usePlaceOrders();

  const symbol = useAtomValue(selectedSymbolAtom);
  const { orders, side, totalQty, avgPrice } = useAtomValue(scaledInRiskTradeAtom);

  const scaleIn = async () => {
    const orderIds = await placeOrders(
      orders.map((order) => ({
        side,
        symbol,
        price: order.price,
        amount: order.size,
        type: OrderType.Limit,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
      })),
    );

    if (orderIds.length) {
      track(EventName.Trade, {
        from: 'scaled_in_risk',
        order: {
          symbol,
          side,
          amount: totalQty,
          price: avgPrice,
          takeProfit: orders[0].takeProfit,
          stopLoss: orders[0].stopLoss,
        },
      });
    }
  };

  return scaleIn;
};

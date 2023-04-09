import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { selectedAtom } from '../../app-state';
import {
  selectedTradeAtom,
  tradeFromAtom,
  tradeLastTouchedAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
} from '../../atoms/trade.atoms';
import { floorStep } from '../../utils/floor-step.utils';
import {
  scaleFromAtom,
  scaleToAtom,
} from '../trade/use-scale-size-trade.hooks';
import { simpleTradeEntryAtom } from '../trade/use-simple-orders-trade.hooks';

import type { CandleSeries, LightweightChart } from './chart.types';

const copyPriceAtom = atom(null, (get, set, value: string) => {
  const selectedInput = get(tradeLastTouchedAtom);
  const selectedTrade = get(selectedTradeAtom);

  if (selectedTrade === 'scale_in_risk') {
    if (selectedInput === 'from') set(tradeFromAtom, value);
    if (selectedInput === 'to') set(tradeStopLossAtom, value);
    if (selectedInput === 'takeProfit') set(tradeTakeProfitAtom, value);
  }

  if (selectedTrade === 'scale_in_size') {
    if (selectedInput === 'from') set(scaleFromAtom, value);
    if (selectedInput === 'to') set(scaleToAtom, value);
    if (selectedInput === 'takeProfit') set(tradeTakeProfitAtom, value);
    if (selectedInput === 'stopLoss') set(tradeStopLossAtom, value);
  }

  if (selectedTrade === 'all_in_one') {
    if (selectedInput === 'to') set(tradeStopLossAtom, value);
    if (selectedInput === 'takeProfit') set(tradeTakeProfitAtom, value);
  }

  if (selectedTrade === 'simple') {
    if (selectedInput === 'entry') set(simpleTradeEntryAtom, value);
  }
});

export const useCopyPrice = ({
  chart,
  candleSeries,
}: {
  chart?: LightweightChart;
  candleSeries?: CandleSeries;
}) => {
  const { market } = useAtomValue(selectedAtom);
  const copyPrice = useSetAtom(copyPriceAtom);

  const priceStep = market?.precision?.price ?? 0;

  useEffect(() => {
    const listener = (data: any) => {
      const price = candleSeries?.coordinateToPrice(data.point.y);
      const adjusted = floorStep(price ?? 0, priceStep);
      copyPrice(adjusted.toString());
    };

    chart?.subscribeClick(listener);

    return () => {
      chart?.unsubscribeClick(listener);
    };
  }, [chart, candleSeries, priceStep, copyPrice]);
};

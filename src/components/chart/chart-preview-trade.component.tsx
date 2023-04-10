import type { PriceLineOptions } from '@iam4x/lightweight-charts';
import { atom, useAtomValue } from 'jotai';
import React from 'react';
import { OrderType } from 'safe-cex/dist/types';

import { displayPreviewTradeAtom } from '../../atoms/app.atoms';
import {
  selectedTradeAtom,
  tradeEntryOrCurrentPriceAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
} from '../../atoms/trade.atoms';
import type { CandleSeries } from '../../hooks/chart/chart.types';
import { aioTradeAtom } from '../../hooks/trade/use-aio-trade.hooks';
import { scaledInRiskTradeAtom } from '../../hooks/trade/use-scale-risk-trade.hooks';
import { scaleInSizeAtom } from '../../hooks/trade/use-scale-size-trade.hooks';
import { simpleOrdersTradeAtom } from '../../hooks/trade/use-simple-orders-trade.hooks';
import { pFloat } from '../../utils/parse-float.utils';

import { ChartLineComponent } from './chart-line.component';

const chartPreviewAtom = atom((get) => {
  const selectedTrade = get(selectedTradeAtom);

  if (selectedTrade === 'scale_in_size') {
    const { orders, from, to, stopLoss, takeProfit, size } = get(scaleInSizeAtom);

    if (!(from && to)) return [];

    const lines = orders.map<PriceLineOptions>((order) => ({
      price: pFloat(order.price),
      color: '#3772FF',
      lineWidth: 1,
      lineStyle: 4,
      lineVisible: true,
      axisLabelVisible: true,
      title: '',
    }));

    if (stopLoss) {
      lines.push({
        price: pFloat(stopLoss),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'STOP',
        textB: `@ ${stopLoss}`,
        textC: `${size}`,
      });
    }

    if (takeProfit) {
      lines.push({
        price: pFloat(takeProfit),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'TP',
        textB: `@ ${takeProfit}`,
        textC: `${size}`,
      });
    }

    return lines;
  }

  if (selectedTrade === 'scale_in_risk') {
    const entryPrice = get(tradeEntryOrCurrentPriceAtom);
    const stopLoss = get(tradeStopLossAtom);

    const { orders, totalQty, entryQty, takeProfit } = get(scaledInRiskTradeAtom);

    const isValid = entryPrice && totalQty && stopLoss;
    if (!isValid) return [];

    const lines: PriceLineOptions[] = [
      {
        price: pFloat(entryPrice),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'ENTRY',
        textB: `@ ${entryPrice}`,
        textC: `${entryQty}`,
      },
      {
        price: pFloat(stopLoss),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'STOP',
        textB: `@ ${stopLoss}`,
        textC: `${totalQty}`,
      },
      ...orders.map<PriceLineOptions>((order) => ({
        price: pFloat(order.price),
        color: '#3772FF',
        lineWidth: 1,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
      })),
    ];

    if (takeProfit) {
      lines.push({
        price: pFloat(takeProfit),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'TP',
        textB: `@ ${takeProfit}`,
        textC: `${totalQty}`,
      });
    }

    return lines;
  }

  if (selectedTrade === 'all_in_one') {
    const { totalQuantity, orders } = get(aioTradeAtom);

    const stopLoss = get(tradeStopLossAtom);
    const takeProfit = get(tradeTakeProfitAtom);

    const lines = orders.map<PriceLineOptions>((order) => ({
      price: pFloat(order.price),
      color: '#3772FF',
      lineWidth: 1,
      lineStyle: 4,
      lineVisible: true,
      axisLabelVisible: true,
      title: ``,
      textA: order.side,
      textB: `@ ${order.price}`,
      textC: `${order.amount}`,
    }));

    if (stopLoss) {
      lines.push({
        price: pFloat(stopLoss),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'STOP',
        textB: `@ ${stopLoss}`,
        textC: `${totalQuantity}`,
      });
    }

    if (takeProfit) {
      lines.push({
        price: pFloat(takeProfit),
        color: '#3772FF',
        lineWidth: 2,
        lineStyle: 4,
        lineVisible: true,
        axisLabelVisible: true,
        title: '',
        textA: 'TP',
        textB: `@ ${takeProfit}`,
        textC: `${totalQuantity}`,
      });
    }

    return lines;
  }

  if (selectedTrade === 'simple') {
    const { type, price, size } = get(simpleOrdersTradeAtom);

    let textA = 'ENTRY';
    if (type === OrderType.StopLoss) textA = 'SL';
    if (type === OrderType.TakeProfit) textA = 'TP';

    let textC = `${size || '0.00'}`;
    if (type === OrderType.StopLoss || type === OrderType.TakeProfit) {
      textC = '';
    }

    const lines: PriceLineOptions[] = [];

    lines.push({
      price: pFloat(price),
      color: '#3772FF',
      lineWidth: 2,
      lineStyle: 4,
      lineVisible: true,
      axisLabelVisible: true,
      title: '',
      textA,
      textB: `@ ${price}`,
      textC,
    });

    return lines;
  }

  return [];
});

export const ChartPreviewTradeComponent = ({ candleSeries }: { candleSeries?: CandleSeries }) => {
  const displayPreview = useAtomValue(displayPreviewTradeAtom);
  const lines = useAtomValue(chartPreviewAtom);

  return (
    <>
      {displayPreview &&
        lines
          .map((line, idx) => ({ ...line, idx }))
          .map((line) => (
            <ChartLineComponent key={line.idx} candleSeries={candleSeries} line={line} />
          ))}
    </>
  );
};

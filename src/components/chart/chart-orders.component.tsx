import type { LineWidth } from '@iam4x/lightweight-charts';
import { useAtomValue } from 'jotai';
import { toUpper } from 'lodash';
import React, { useMemo } from 'react';
import { OrderSide, OrderType, PositionSide } from 'safe-cex/dist/types';

import { selectedAtom } from '../../app-state';
import { privacyAtom } from '../../atoms/app.atoms';
import type { CandleSeries } from '../../hooks/chart/chart.types';
import { toUSD } from '../../utils/to-usd.utils';

import { ChartLineComponent } from './chart-line.component';

const tpOrSLTypes = [OrderType.StopLoss, OrderType.TakeProfit, OrderType.TrailingStopLoss];

const draggableOrderTypes = [OrderType.StopLoss, OrderType.TakeProfit, OrderType.Limit];

export const ChartOrdersComponent = ({ candleSeries }: { candleSeries?: CandleSeries }) => {
  const { orders, positions } = useAtomValue(selectedAtom);
  const privacy = useAtomValue(privacyAtom);

  // we need the position to calculate est profit/loss
  const ordersWithPosition = orders.map((order) => {
    const isTPorSL = tpOrSLTypes.includes(order.type);

    const position = positions.find((p) => {
      if (isTPorSL) {
        return order.side === OrderSide.Buy
          ? p.side === PositionSide.Short
          : p.side === PositionSide.Long;
      }

      return OrderSide.Buy ? p.side === PositionSide.Long : p.side === PositionSide.Short;
    });

    return { order, position };
  });

  const checkSum = ordersWithPosition
    .map(
      ({ order: o, position: p }) =>
        o.id + o.type + o.amount + o.price + o.side + (p?.entryPrice || 0) + (p?.contracts || 0),
    )
    .join('__');

  const lines = useMemo(
    () =>
      ordersWithPosition.map(({ order, position }) => {
        let textA = toUpper(`${order.side} Limit`);
        let textB = `${order.amount}`;
        let textC = '';

        const color = order.side === OrderSide.Sell ? '#f44336' : '#45b26b';

        if (order.type === OrderType.TakeProfit) {
          const amount = position?.contracts || order.amount;

          textA = 'TP';
          textB = amount ? `${amount}` : '(TP)';

          if (amount && position?.entryPrice) {
            const priceDiff =
              order.price > position.entryPrice
                ? order.price - position.entryPrice
                : position.entryPrice - order.price;

            const profit = priceDiff * amount;
            textC = `+${toUSD(profit)}`;
          }
        }

        if (order.type === OrderType.StopLoss || order.type === OrderType.TrailingStopLoss) {
          const amount = position?.contracts || order.amount;

          textA = order.type === OrderType.StopLoss ? 'SL' : 'TSL';
          textB = amount ? `${amount}` : '(CLOSE)';

          if (amount && position?.entryPrice) {
            const priceDiff =
              order.price > position.entryPrice
                ? order.price - position.entryPrice
                : position.entryPrice - order.price;

            const profit = priceDiff * amount;
            const isLoss =
              order.side === OrderSide.Sell
                ? order.price < position.entryPrice
                : order.price > position.entryPrice;

            textC = `${isLoss ? '-' : '+'}${toUSD(profit)}`;
          }
        }

        if (privacy) {
          textB = '****';
          textC = textC ? '****' : '';
        }

        return {
          id: order.id,
          title: '',
          price: order.price,
          lineWidth: 1 as LineWidth,
          lineStyle: 3,
          lineVisible: true,
          axisLabelVisible: true,
          draggable: draggableOrderTypes.includes(order.type),
          color,
          textA,
          textB,
          textC,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkSum, privacy],
  );

  const chartLines = useMemo(
    () =>
      lines.map((line) => (
        <ChartLineComponent key={line.id} line={line} candleSeries={candleSeries} />
      )),
    [candleSeries, lines],
  );

  return <>{chartLines}</>;
};

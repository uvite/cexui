import type { LineWidth, PriceLineOptions } from '@iam4x/lightweight-charts';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';

import { privacyAtom } from '../../atoms/app.atoms';
import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import type { CandleSeries } from '../../hooks/chart/chart.types';
import { useSymbolPositions } from '../../hooks/use-positions.hooks';
import { pFloat } from '../../utils/parse-float.utils';
import { toUSD } from '../../utils/to-usd.utils';

import { ChartLineComponent } from './chart-line.component';

export const ChartPositionsComponent = ({
  candleSeries,
}: {
  candleSeries?: CandleSeries;
}) => {
  const symbol = useAtomValue(selectedSymbolAtom);
  const positions = useSymbolPositions(symbol);
  const privacy = useAtomValue(privacyAtom);

  const positionsChecksum = positions.map((p) => JSON.stringify(p)).join('__');

  const priceLines = useMemo(
    () =>
      positions.flatMap((position) => {
        const lines: PriceLineOptions[] = [];
        const { entryPrice, side, contracts, unrealizedPnl, liquidationPrice } =
          position;

        if (liquidationPrice > 0) {
          const priceDiff =
            Math.max(pFloat(entryPrice), pFloat(liquidationPrice)) -
            Math.min(pFloat(entryPrice), pFloat(liquidationPrice));

          const loss = priceDiff * contracts;

          lines.push({
            price: pFloat(liquidationPrice),
            color: '#f97316',
            lineWidth: 1 as LineWidth,
            lineStyle: 1,
            lineVisible: true,
            axisLabelVisible: true,
            title: '',
            textA: 'LIQUIDATION',
            textB: privacy ? '****' : `${contracts}`,
            textC: privacy ? '****' : `-${toUSD(loss)}`,
          });
        }

        lines.push({
          price: pFloat(entryPrice),
          color: side === 'long' ? '#45b26b' : '#f44336',
          lineWidth: 2 as LineWidth,
          lineStyle: 0,
          lineVisible: true,
          axisLabelVisible: true,
          title: '',
          textA: side?.toUpperCase(),
          textB: privacy ? '****' : `${contracts}`,
          textC: privacy ? '****' : toUSD(unrealizedPnl),
        });

        return lines;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positionsChecksum, privacy]
  );

  return (
    <>
      {priceLines.map((priceLine) => (
        <ChartLineComponent
          key={`${priceLine.price}-${priceLine.color}`}
          candleSeries={candleSeries}
          line={priceLine}
        />
      ))}
    </>
  );
};

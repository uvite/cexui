import { useAtom, useAtomValue } from 'jotai';
import React, { useRef } from 'react';
import { AiFillStar } from 'react-icons/ai';

import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import { useChart } from '../../hooks/chart/use-chart.hooks';
import { useFavorites } from '../../hooks/use-favorites.hooks';
import { selectedTimeframeAtom, timeframes } from '../../hooks/use-timeframe.hooks';
import { ButtonComponent } from '../ui/button.component';
import { GridBlockComponent } from '../ui/grid-block.component';

import { ChartNewsComponent } from './chart-news.component';
import { ChartOHLCComponent } from './chart-ohlc.component';
import { ChartOrdersComponent } from './chart-orders.component';
import { ChartPositionsComponent } from './chart-positions.component';
import { ChartPreviewTradeComponent } from './chart-preview-trade.component';

export const ChartComponent = ({ movable = true }: { movable?: boolean }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const { isFav, toggleFav } = useFavorites();

  const symbol = useAtomValue(selectedSymbolAtom);
  const [interval, setInterval] = useAtom(selectedTimeframeAtom);

  const { candleSeries } = useChart({ container: chartContainerRef });

  return (
    <GridBlockComponent
      movable={movable}
      title={
        <div className="flex items-center">
          <div className="flex items-center">
            <span className="mr-2 font-bold">Chart</span>
            <span className="mr-1 cursor-pointer" onClick={() => toggleFav(symbol)}>
              <AiFillStar color={isFav(symbol) ? '#EAB308' : '#777E90'} />
            </span>
            <span className="font-mono">{symbol.replace(/:.+/, '')}</span>
          </div>
          <div className="ml-auto flex items-center">
            {timeframes.map((i) => (
              <ButtonComponent
                key={i.value}
                size="small"
                className="mx-[2px] font-mono text-xs first:ml-0 last:mr-0"
                selected={interval === i.value}
                onClick={() => setInterval(i.value)}
              >
                {i.label}
              </ButtonComponent>
            ))}
          </div>
        </div>
      }
    >
      <div className="flex h-full w-full select-none flex-col">
        <div className="no-scrollbar relative h-full w-full flex-1 overflow-hidden">
          <ChartOHLCComponent />
          <div ref={chartContainerRef} className="h-full w-full" />
          <ChartPreviewTradeComponent candleSeries={candleSeries} />
          <ChartPositionsComponent candleSeries={candleSeries} />
          <ChartOrdersComponent candleSeries={candleSeries} />
          <ChartNewsComponent candleSeries={candleSeries} />
        </div>
      </div>
    </GridBlockComponent>
  );
};

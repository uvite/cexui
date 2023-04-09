import { useAtomValue, useSetAtom } from 'jotai';
import dynamic from 'next/dynamic';
import React, { useCallback, useMemo } from 'react';
import type { Layouts } from 'react-grid-layout';
import { WidthProvider, Responsive } from 'react-grid-layout';

import { AppBlock } from '../app.types';
import { hiddenBlocksAtom, layoutsAtom } from '../atoms/app.atoms';
import { useAppShortcuts } from '../hooks/use-shortcuts.hooks';

import { AccountSummaryComponent } from './account-summary.component';
import { LogsComponent } from './logs.component';
import { NewsComponent } from './news/news.component';
import { OrdersComponent } from './orders/orders.component';
import { PositionsTableComponent } from './positions/positions-table.component';
import { TickerInfosComponent } from './ticker-infos/ticker-infos.component';
import { TickersComponent } from './tickers/tickers.component';
import { TradeComponent } from './trade/trade.component';

const ResponsiveGridLayout = WidthProvider(Responsive);
const ChartComponent = dynamic(
  () =>
    import(/* webpackChunkName: "chart" */ './chart/chart.component').then(
      (mod) => mod.ChartComponent
    ),
  { ssr: false }
);

const blocks: Record<AppBlock, React.ComponentType> = {
  [AppBlock.Chart]: ChartComponent,
  [AppBlock.Positions]: PositionsTableComponent,
  [AppBlock.Orders]: OrdersComponent,
  [AppBlock.Account]: AccountSummaryComponent,
  [AppBlock.Trade]: TradeComponent,
  [AppBlock.Tickers]: TickersComponent,
  [AppBlock.TickerInfo]: TickerInfosComponent,
  [AppBlock.News]: NewsComponent,
  [AppBlock.Logs]: LogsComponent,
};

export const GridComponent = ({ layouts }: { layouts: Layouts }) => {
  useAppShortcuts();

  const setLayouts = useSetAtom(layoutsAtom);
  const hiddenBlocks = useAtomValue(hiddenBlocksAtom);

  const withoutHidden = useMemo(
    () => ({
      lg: layouts.lg.filter((l) => !hiddenBlocks.includes(l.i as AppBlock)),
      xs: layouts.xs.filter((l) => !hiddenBlocks.includes(l.i as AppBlock)),
    }),
    [hiddenBlocks, layouts.lg, layouts.xs]
  );

  const updateLayouts = useCallback(
    (update: Layouts) => {
      const lg = [...update.lg];
      const xs = [...update.xs];

      if (hiddenBlocks.length > 0) {
        lg.push(
          ...layouts.lg.filter((l) => hiddenBlocks.includes(l.i as AppBlock))
        );
        xs.push(
          ...layouts.xs.filter((l) => hiddenBlocks.includes(l.i as AppBlock))
        );
      }

      const lgHasChanged = layouts.lg.some((l) => {
        const updated = lg.find((u) => u.i === l.i);
        return (
          updated &&
          (updated.h !== l.h ||
            updated.w !== l.w ||
            updated.x !== l.x ||
            updated.y !== l.y)
        );
      });

      const xsHasChanged = layouts.xs.some((l) => {
        const updated = xs.find((u) => u.i === l.i);
        return (
          updated &&
          (updated.h !== l.h ||
            updated.w !== l.w ||
            updated.x !== l.x ||
            updated.y !== l.y)
        );
      });

      if (lgHasChanged || xsHasChanged) {
        setLayouts({ lg, xs });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hiddenBlocks, layouts.lg, layouts.xs]
  );

  return (
    <ResponsiveGridLayout
      draggableHandle=".draggable"
      layouts={withoutHidden}
      breakpoints={{ xs: 0, lg: 1750 }}
      cols={{ xs: 12, lg: 12 }}
      rowHeight={50}
      margin={{ xs: [8, 8], lg: [8, 8] }}
      onLayoutChange={(_, update) => updateLayouts(update)}
    >
      {Object.entries(blocks)
        .filter(([key]) => !hiddenBlocks.includes(key as AppBlock))
        .map(([key, Component]) => (
          <div key={key}>
            <Component />
          </div>
        ))}
    </ResponsiveGridLayout>
  );
};

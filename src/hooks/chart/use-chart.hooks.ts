import type { MutableRefObject } from 'react';

import { useCopyPrice } from './use-copy-price.hooks';
import { useDragOrders } from './use-drag-order.hooks';
import { useDrawChart } from './use-draw-chart.hooks';
import { useDrawKline } from './use-draw-kline.hooks';
import { useHOLC } from './use-ohlc.hooks';

export const useChart = ({
  container,
}: {
  container: MutableRefObject<HTMLDivElement | null>;
}) => {
  const { chart, candleSeries, volumeSeries } = useDrawChart({ container });

  useDrawKline({ candleSeries, volumeSeries, chart });
  useCopyPrice({ chart, candleSeries });
  useHOLC({ chart, candleSeries, volumeSeries });
  useDragOrders({ chart });

  return { chart, candleSeries, volumeSeries };
};

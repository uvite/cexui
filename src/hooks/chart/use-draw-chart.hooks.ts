import type { ColorType } from '@iam4x/lightweight-charts';
import type { MutableRefObject } from 'react';
import { useRef, useEffect } from 'react';
import useResizeObserver from 'use-resize-observer';

import type {
  LightweightChart,
  CandleSeries,
  VolumeSeries,
} from './chart.types';

export const useDrawChart = ({
  container,
}: {
  container: MutableRefObject<HTMLDivElement | null>;
}) => {
  const chart = useRef<LightweightChart>();
  const candleSeries = useRef<CandleSeries>();
  const volumeSeries = useRef<VolumeSeries>();

  const { width, height } = useResizeObserver({ ref: container });

  useEffect(() => {
    if (chart.current && width && height) {
      chart.current.resize(width, height, true);
    }
  }, [width, height]);

  useEffect(() => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    import('@iam4x/lightweight-charts').then(({ createChart }) => {
      if (container.current && !chart.current) {
        chart.current = createChart(container.current, {
          layout: {
            background: {
              type: 'solid' as ColorType,
              color: '#23262F',
            },
            textColor: '#777E90',
          },
          crosshair: {
            mode: 0,
          },
          grid: {
            horzLines: { color: '#353945' },
            vertLines: { color: '#353945' },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: true,
            rightOffset: 20,
          },
        });

        volumeSeries.current = chart.current.addHistogramSeries({
          color: '#353945',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
          lastValueVisible: false,
        });

        candleSeries.current = chart.current.addCandlestickSeries({
          upColor: '#45b26b',
          downColor: '#f44336',
        });
      }
    });
  }, [container]);

  return {
    chart: chart.current,
    candleSeries: candleSeries.current,
    volumeSeries: volumeSeries.current,
  };
};

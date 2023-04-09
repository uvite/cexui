import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { selectedAtom } from '../../app-state';
import { afterDecimal } from '../../utils/after-decimal.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { toPercentage } from '../../utils/percentage.utils';

import type {
  CandleSeries,
  LightweightChart,
  VolumeSeries,
} from './chart.types';

type OHLC = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export const hoveredOHLCAtom = atom<OHLC | null>(null);
export const lastOHLCAtom = atom<OHLC>({ open: 0, high: 0, low: 0, close: 0 });

export const hoveredVolumeAtom = atom<number | null>(null);
export const lastVolumeAtom = atom<number>(0);

export const displayHOLCAtom = atom((get) => {
  const { market } = get(selectedAtom);
  const hoveredOHLC = get(hoveredOHLCAtom);
  const lastOHLC = get(lastOHLCAtom);

  const step = market?.precision?.price || 0;
  const ohlc = hoveredOHLC || lastOHLC;

  return {
    open: pFloat(ohlc.open.toFixed(afterDecimal(step))),
    high: pFloat(ohlc.high.toFixed(afterDecimal(step))),
    low: pFloat(ohlc.low.toFixed(afterDecimal(step))),
    close: pFloat(ohlc.close.toFixed(afterDecimal(step))),
    percentage: toPercentage({ now: ohlc.close, start: ohlc.open }),
  };
});

export const displayVolumeAtom = atom(
  (get) => get(hoveredVolumeAtom) || get(lastVolumeAtom)
);

export const useHOLC = ({
  chart,
  candleSeries,
  volumeSeries,
}: {
  chart?: LightweightChart;
  candleSeries?: CandleSeries;
  volumeSeries?: VolumeSeries;
}) => {
  const setHoveredOHLC = useSetAtom(hoveredOHLCAtom);
  const setHoveredVolume = useSetAtom(hoveredVolumeAtom);

  useEffect(() => {
    const listener = (data: any) => {
      if (
        data === undefined ||
        data.time === undefined ||
        data.point.x < 0 ||
        data.point.y < 0
      ) {
        setHoveredOHLC(null);
        return;
      }

      const ohlc = data?.seriesPrices?.get?.(candleSeries);
      if (ohlc) setHoveredOHLC(ohlc);

      const volume = data?.seriesPrices?.get?.(volumeSeries);
      if (volume) setHoveredVolume(volume);
    };

    chart?.subscribeCrosshairMove(listener);

    return () => {
      chart?.unsubscribeCrosshairMove(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candleSeries, chart, volumeSeries]);
};

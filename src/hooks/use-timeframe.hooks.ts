import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type ChartTF = '1d' | '1h' | '1m' | '3m' | '4h' | '5m' | '15m';
export const selectedTimeframeAtom = atomWithStorage<ChartTF>(
  'selectedTimeframe',
  '5m'
);

export const timeframes: Array<{ label: string; value: ChartTF }> = [
  { label: '1m', value: '1m' },
  { label: '3m', value: '3m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

export const cycleTimeframeAtom = atom(null, (get, set) => {
  const current = get(selectedTimeframeAtom);
  const currentIdx = timeframes.findIndex((t) => t.value === current);

  set(
    selectedTimeframeAtom,
    timeframes[(currentIdx + 1) % timeframes.length].value
  );
});

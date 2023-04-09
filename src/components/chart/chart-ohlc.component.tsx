import { useAtomValue } from 'jotai';
import React from 'react';

import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import {
  displayHOLCAtom,
  displayVolumeAtom,
} from '../../hooks/chart/use-ohlc.hooks';
import { selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import {
  selectedTimeframeAtom,
  timeframes,
} from '../../hooks/use-timeframe.hooks';

export const ChartOHLCComponent = () => {
  const symbol = useAtomValue(selectedSymbolAtom);
  const interval = useAtomValue(selectedTimeframeAtom);

  const holc = useAtomValue(displayHOLCAtom);
  const volume = useAtomValue(displayVolumeAtom);

  const account = useAtomValue(selectedAccountAtom);

  return (
    <div className="absolute top-2 left-3 z-10 flex items-end">
      <div className="text-dark-text-gray font-mono text-xl flex items-end">
        <span>{account?.exchange?.toUpperCase()}</span>
        <span className="mx-1">·</span>
        <span>{symbol.replace(/:.+/, '')}</span>
        <span className="mx-1">·</span>
        <span>{timeframes.find((i) => i.value === interval)?.label}</span>
        <span className="mx-1">·</span>
        <div className="text-base">
          <span className="mr-1">O</span>
          <span className="text-dark-border-gray-2/50">{holc.open}</span>
          <span className="mx-1">H</span>
          <span className="text-dark-border-gray-2/50">{holc.high}</span>
          <span className="mx-1">L</span>
          <span className="text-dark-border-gray-2/50">{holc.low}</span>
          <span className="mx-1">C</span>
          <span className="text-dark-border-gray-2/50">{holc.close}</span>
          <span className="mx-1">V</span>
          <span className="text-dark-border-gray-2/50">{volume}</span>
          <span className="mx-1"></span>
          <span className="text-dark-border-gray-2/50 text-sm">
            ({holc.close < holc.open ? '-' : '+'}
            {holc.percentage})
          </span>
        </div>
      </div>
    </div>
  );
};

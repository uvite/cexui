import { useAtomValue, useSetAtom } from 'jotai';
import React, { useContext, useState } from 'react';
import { Range } from 'react-range';

import { marketsAtom, positionsAtom } from '../../app-state';
import { Exchange, selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { ConnectorContext } from '../../hooks/use-exchange-connector.hooks';
import { ButtonComponent } from '../ui/button.component';

export const TickerLeverageComponent = ({
  symbol,
  positionLeverage,
}: {
  symbol: string;
  positionLeverage: number;
}) => {
  const track = useAnalytics();

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedValue, setUpdatedValue] = useState<number | null>(null);

  const markets = useAtomValue(marketsAtom);
  const account = useAtomValue(selectedAccountAtom);

  const setPositions = useSetAtom(positionsAtom);
  const connector = useContext(ConnectorContext);

  const market = markets.find((m) => m.symbol === symbol);
  const maxLeverage = market?.limits?.leverage?.max ?? 125;
  const step = account?.exchange === Exchange.Binance ? 1 : 0.25;

  const handleChange = (value: number) => {
    setTouched(true);
    setUpdatedValue(value);
  };

  const handleUpdate = async () => {
    if (connector && updatedValue) {
      setLoading(true);
      track(EventName.UpdateLeverage, { symbol, leverage: updatedValue });

      try {
        await connector.setLeverage(symbol, updatedValue);
        setPositions((prev) =>
          prev.map((p) => (p.symbol === symbol ? { ...p, leverage: updatedValue } : p)),
        );
      } finally {
        setLoading(false);
        setTouched(false);
        setUpdatedValue(null);
      }
    }
  };

  const displayedValue = touched && updatedValue !== null ? updatedValue : positionLeverage;

  return (
    <div>
      <div className="mt-3 flex items-center">
        <div className="mr-4 font-bold">Leverage</div>
        <div className="w-3/4 flex-1 pr-1">
          <Range
            step={step}
            min={1}
            max={Math.max(maxLeverage, displayedValue)}
            values={[displayedValue]}
            renderTrack={({ props, children }) => (
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={([value]) => handleChange(value)}
          />
        </div>
        <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[65px] border text-center font-mono text-xs">
          {displayedValue}x
        </div>
      </div>
      {touched && (
        <div className="text-right">
          <ButtonComponent size="xsmall" loading={loading} onClick={handleUpdate}>
            UPDATE
          </ButtonComponent>
        </div>
      )}
    </div>
  );
};

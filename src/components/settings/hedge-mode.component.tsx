import { useAtomValue } from 'jotai';
import React, { useContext, useState } from 'react';

import { optionsAtom } from '../../app-state';
import { ConnectorContext } from '../../hooks/use-exchange-connector.hooks';
import { usePositions } from '../../hooks/use-positions.hooks';
import { ToggleInputComponent } from '../ui/toggle-input.component';

export const HedgeModeSettingsComponent = () => {
  const [isLoading, setLoading] = useState(false);

  const exchange = useContext(ConnectorContext);
  const { isHedged } = useAtomValue(optionsAtom);

  const positions = usePositions();
  const hasPositionOpen = positions.length > 0;

  const handleClick = async (hedged: boolean) => {
    if (exchange && !isLoading) {
      setLoading(true);
      await exchange.changePositionMode(hedged);
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 min-h-[300px] px-6 py-4">
      <div className="mb-4">
        <div className="text-lg font-bold">Hedge mode</div>
        <p className="text-dark-text-gray py-2 text-sm">
          Hedge mode enables you to take both long and short positions on the same coin
          simultaneously, which can help you reduce your risk exposure.
          <br />
          <br />
          Enabling Hedge mode has no downsides, and it allows you to quickly hedge your current
          positions by taking an inverse 1:1 position.
          <br />
          <br />
          <strong>To switch between Hedge mode and normal, you must have no open positions.</strong>
        </p>
        <div className="mt-4">
          <ToggleInputComponent
            disabled={hasPositionOpen || isLoading}
            oneButton={true}
            labelNo="HEDGE MODE"
            labelYes="HEDGE MODE"
            value={isHedged}
            onChange={handleClick}
          />
        </div>
      </div>
    </div>
  );
};

import { useAtomValue } from 'jotai';
import { get, maxBy, minBy } from 'lodash';
import React, { useContext, useState } from 'react';
import { Range } from 'react-range';

import { marketsAtom } from '../../app-state';
import { Exchange, selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { ConnectorContext } from '../../hooks/use-exchange-connector.hooks';
import { errorToast } from '../../notifications/error.toast';
import { successToast } from '../../notifications/success.toast';
import { ButtonComponent } from '../ui/button.component';

export const LeverageSettingsComponent = () => {
  const track = useAnalytics();

  const connector = useContext(ConnectorContext);
  const markets = useAtomValue(marketsAtom);
  const account = useAtomValue(selectedAccountAtom);

  const [value, setValue] = useState(10);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const step = account?.exchange === Exchange.Binance ? 1 : 0.25;

  const k = 'limits.leverage.max';
  const k2 = 'limits.leverage.min';
  const max = get(maxBy(markets, k as any), k) ?? 125;
  const min = get(minBy(markets, k2 as any), k2) ?? 1;

  const handleUpdate = async () => {
    if (!loading && connector?.setAllLeverage) {
      setLoading(true);
      track(EventName.UpdateAllLeverage, { leverage: value });

      try {
        await connector.setAllLeverage(value);
        successToast('Leverage applied to all instruments!');
      } catch (err: any) {
        errorToast(err?.response?.data?.msg || err?.message || 'Failed to update leverage');
      } finally {
        setLoading(false);
        setTouched(false);
      }
    }
  };

  return (
    <div className="mb-4 min-h-[300px] px-6 py-4">
      <div className="mb-4">
        <div className="text-lg font-bold">Leverage</div>
        <p className="text-dark-text-gray py-2 text-sm">
          This slider allows you to change leverage on every instruments per account.
          <br />
          <br />
          If you select a leverage above the maximum leverage allowed by your exchange on a specific
          instrument, it will set it to the maximum allowed.
          <br />
          <br />
          <strong>This will update {markets.length} instruments, please be patient...</strong>
        </p>
        <div className="mt-4 flex items-center">
          <Range
            step={step}
            min={min}
            max={max}
            values={[value]}
            renderTrack={({ props, children }) => (
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={([newValue]) => {
              setValue(newValue);
              setTouched(true);
            }}
          />
          <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[65px] border text-center font-mono text-xs">
            {value}x
          </div>
        </div>
        <div className="mt-4 text-right">
          <ButtonComponent
            size="small"
            className={loading ? 'animate-pulse' : undefined}
            loading={loading}
            disabled={!touched}
            onClick={handleUpdate}
          >
            {loading ? 'Loading...' : 'Update'}
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
};

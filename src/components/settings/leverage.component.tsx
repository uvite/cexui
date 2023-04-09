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
        errorToast(
          err?.response?.data?.msg ||
            err?.message ||
            'Failed to update leverage'
        );
      } finally {
        setLoading(false);
        setTouched(false);
      }
    }
  };

  return (
    <div className="px-6 py-4 mb-4 min-h-[300px]">
      <div className="mb-4">
        <div className="font-bold text-lg">Leverage</div>
        <p className="text-dark-text-gray text-sm py-2">
          This slider allows you to change leverage on every instruments per
          account.
          <br />
          <br />
          If you select a leverage above the maximum leverage allowed by your
          exchange on a specific instrument, it will set it to the maximum
          allowed.
          <br />
          <br />
          <strong>
            This will update {markets.length} instruments, please be patient...
          </strong>
        </p>
        <div className="flex items-center mt-4">
          <Range
            step={step}
            min={min}
            max={max}
            values={[value]}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="bg-dark-border-gray-2 w-full h-[3px] rounded-lg"
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                className="bg-dark-border-gray-2 w-4 h-4 rounded-full"
              />
            )}
            onChange={([newValue]) => {
              setValue(newValue);
              setTouched(true);
            }}
          />
          <div className="ml-4 w-[65px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
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

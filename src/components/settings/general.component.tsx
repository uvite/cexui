import cx from 'clsx';
import { useAtom, useSetAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import React from 'react';
import { Range } from 'react-range';
import Select from 'react-select';

import { defaultSettings } from '../../app-settings';
import { layoutsAtom } from '../../atoms/app.atoms';
import {
  fatFingerProtectionAtom,
  maxRiskAtom,
  riskAtom,
  tradeBuyIntoAtom,
  tradeSellIntoAtom,
} from '../../atoms/trade.atoms';
import { aioTradesSizesAtom } from '../../hooks/trade/use-aio-trade.hooks';
import { pFloat } from '../../utils/parse-float.utils';
import { toUSD } from '../../utils/to-usd.utils';
import { ButtonComponent } from '../ui/button.component';

const priceTypesValues = [
  { value: 'mark', label: 'Mark price' },
  { value: 'index', label: 'Index price' },
  { value: 'index', label: 'Last price' },
  { value: 'bid', label: 'Bid price' },
  { value: 'ask', label: 'Ask price' },
];

const PriceSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: any) => void;
}) => {
  return (
    <Select
      id="sell-into"
      instanceId="sell-into"
      classNamePrefix="react-select"
      className="react-select-container font-mono font-semibold text-xs"
      name="sell-into"
      isClearable={false}
      blurInputOnSelect={true}
      isSearchable={false}
      value={priceTypesValues.find((v) => v.value === value)}
      options={priceTypesValues}
      onChange={(event) => onChange(event!.value)}
    />
  );
};

export const GeneralSettingsComponent = () => {
  const [fatFinger, setFatFinger] = useAtom(fatFingerProtectionAtom);

  const [sellInto, setSellInto] = useAtom(tradeSellIntoAtom);
  const [buyInto, setBuyInto] = useAtom(tradeBuyIntoAtom);

  const [maxRisk, setMaxRisk] = useAtom(maxRiskAtom);
  const setRisk = useSetAtom(riskAtom);

  const [aioTradesSizes, setAioTradesSizes] = useAtom(aioTradesSizesAtom);
  const handleSizeChange =
    (index: number) =>
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setAioTradesSizes((prev) => {
        const next = [...prev];
        next[index].value = pFloat(value);
        next[index].label = toUSD(pFloat(value)).replace('.00', '');
        return [...prev];
      });
    };

  const setLayouts = useSetAtom(layoutsAtom);
  const resetGrid = () => {
    setLayouts(defaultSettings.layouts);
  };

  return (
    <div className="px-6 py-4 mb-4">
      <div className="mb-4">
        <div className="font-bold text-lg">Order price settings</div>
        <p className="text-dark-text-gray text-sm py-2">
          The buy/sell price is used when creating limit orders.
          <br />
          For instance, when you open a new position (the first entry order).
          <br />
          Or when increasing/decreasing the position size.
        </p>
      </div>
      <div className="w-2/3">
        <div className="flex items-center mb-4">
          <div className="mr-4 font-bold w-1/4">Buy price</div>
          <div className="w-3/4">
            <PriceSelect value={buyInto} onChange={setBuyInto} />
          </div>
        </div>
        <div className="flex items-center mb-4">
          <div className="mr-4 font-bold w-1/4">Sell price</div>
          <div className="w-3/4">
            <PriceSelect value={sellInto} onChange={setSellInto} />
          </div>
        </div>
      </div>
      <div className="w-full my-4 h-[1px] bg-dark-bg-2"></div>
      <div className="mb-4">
        <div className="font-bold text-lg">Max risk setting</div>
        <p className="text-dark-text-gray text-sm py-2">
          Maximum risk that can be taken on a single trade.
          <br />
          (In percentage of your account size)
        </p>
      </div>
      <div className="w-2/3">
        <div className="flex items-center">
          <div className="flex-1">
            <Range
              step={0.25}
              min={0.25}
              max={100}
              values={[maxRisk]}
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
              onChange={([value]) => {
                setRisk((prev) => (prev > value ? value : prev));
                setMaxRisk(value);
              }}
            />
          </div>
          <div
            className={cx('ml-4 w-[70px] font-mono text-xs text-center', {
              'text-dark-green': maxRisk < 5,
              'text-orange-500': maxRisk >= 5 && maxRisk < 20,
              'text-red-500': maxRisk >= 20,
            })}
          >
            ({maxRisk.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div className="w-full my-4 h-[1px] bg-dark-bg-2"></div>
      <div className="mb-4">
        <div className="font-bold text-lg">Fatfinger protection</div>
        <p className="text-dark-text-gray text-sm py-2">
          Maximum order size in USD, enter 0 or clear the field to disable.
        </p>
        <input
          type="text"
          className="font-mono"
          value={fatFinger}
          onChange={(e) => {
            if (
              e.currentTarget.value === '' ||
              !Number.isNaN(pFloat(e.currentTarget.value))
            ) {
              setFatFinger(e.currentTarget.value);
            }
          }}
        />
      </div>
      <div className="w-full my-4 h-[1px] bg-dark-bg-2"></div>
      <div className="mb-4">
        <div className="font-bold text-lg">Size presets</div>
        <p className="text-dark-text-gray text-sm py-2">
          Sizes in $ used for the fast "all-in-one" trade buttons.
        </p>
      </div>
      <div className="w-2/3">
        <div className="flex items-center">
          <input
            type="text"
            className="w-1/4 font-mono text-center mr-1"
            value={aioTradesSizes[0].value}
            onChange={handleSizeChange(0)}
          />
          <input
            type="text"
            className="w-1/4 font-mono text-center mx-1"
            value={aioTradesSizes[1].value}
            onChange={handleSizeChange(1)}
          />
          <input
            type="text"
            className="w-1/4 font-mono text-center mx-1"
            value={aioTradesSizes[2].value}
            onChange={handleSizeChange(2)}
          />
          <input
            type="text"
            className="w-1/4 font-mono text-center ml-1"
            value={aioTradesSizes[3].value}
            onChange={handleSizeChange(3)}
          />
        </div>
      </div>
      <div className="w-full my-4 h-[1px] bg-dark-bg-2"></div>
      <div className="mb-4">
        <div className="font-bold text-lg">Reset interface</div>
        <p className="text-dark-text-gray text-sm py-2">
          Reset interface to default settings (blocks placement).
        </p>
        <ButtonComponent onClick={resetGrid}>Reset</ButtonComponent>
      </div>
    </div>
  );
};

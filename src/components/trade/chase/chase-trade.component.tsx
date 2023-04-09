import cx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { Range } from 'react-range';
import { OrderSide } from 'safe-cex/dist/types';

import { selectedAtom } from '../../../app-state';
import {
  chaseInfiniteAtom,
  chasePercentLimitAtom,
  chaseStalkAtom,
  tradeReduceOnlyAtom,
  tradeSideAtom,
  tradeSizeAtom,
  tradeSizeUSDAtom,
} from '../../../atoms/trade.atoms';
import { useChaseTrade } from '../../../hooks/trade/use-chase.hooks';
import { useSizeUSD } from '../../../hooks/use-size-usd.hooks';
import { afterDecimal } from '../../../utils/after-decimal.utils';
import { floorStep } from '../../../utils/floor-step.utils';
import { pFloat } from '../../../utils/parse-float.utils';
import { tickerRegex } from '../../../utils/ticker-match/ticker-match.utils';
import { ButtonComponent } from '../../ui/button.component';
import { OrderSideButton } from '../../ui/order-side-button.component';
import { ToggleInputComponent } from '../../ui/toggle-input.component';

import { ChaseRowComponent } from './chase-row.component';

export const ChaseTradeComponent = () => {
  const { startChase, chases } = useChaseTrade();

  const { symbol, ticker, market } = useAtomValue(selectedAtom);
  const { size, sizeUSD, handleChangeSize, handleChangeSizeUSD } = useSizeUSD({
    sizeAtom: tradeSizeAtom,
    sizeUSDAtom: tradeSizeUSDAtom,
  });

  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useAtom(chasePercentLimitAtom);
  const [side, setSide] = useAtom(tradeSideAtom);
  const [reduceOnly, setReduceOnly] = useAtom(tradeReduceOnlyAtom);
  const [infinite, setInfinite] = useAtom(chaseInfiniteAtom);
  const [stalk, setStalk] = useAtom(chaseStalkAtom);

  const price = (side === OrderSide.Buy ? ticker?.bid : ticker?.ask) || 0;
  const pPrice = market?.precision?.price ?? 0;
  const dCount = afterDecimal(pPrice);

  const min = floorStep(price - (price * limit) / 100, pPrice).toFixed(dCount);
  const max = floorStep(price + (price * limit) / 100, pPrice).toFixed(dCount);

  const disabled = !size;

  const opts = {
    symbol,
    size: pFloat(size),
    side,
    reduceOnly,
    min: infinite || stalk ? 0 : pFloat(min),
    max: infinite || stalk ? Infinity : pFloat(max),
    stalk,
    distance: limit,
  };

  const handleSubmit = async () => {
    if (!loading) {
      setLoading(true);
      try {
        await startChase(opts);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="px-2 py-3 text-sm h-full">
      {chases.length === 0 && (
        <p className="text-blue-500 border-2 border-blue-500 rounded-md p-1.5 bg-blue-500/10 font-bold mb-3">
          You need to keep this tab open and connected to this account, but you
          can change tickers and continue trading as usual.
        </p>
      )}
      {chases.length > 0 && (
        <div className="mb-3 border-2 border-dark-bg rounded-md p-1.5 bg-dark-bg/20">
          {chases.map(({ id, chase }) => (
            <ChaseRowComponent key={id} chase={chase} />
          ))}
        </div>
      )}
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Quantity</div>
        <div className="flex flex-1 w-3/4">
          <input
            type="text"
            value={size}
            className="text-right w-full bg-dark-bg font-semibold font-mono"
            onChange={(e) => handleChangeSize(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Size in USD</div>
        <div className="flex flex-1 w-3/4">
          <input
            type="text"
            value={sizeUSD}
            className="text-right w-full bg-dark-bg font-semibold font-mono"
            onChange={(e) => handleChangeSizeUSD(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Side</div>
        <div className="flex w-3/4">
          <div className="w-1/2 mr-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Buy}
              selected={side === OrderSide.Buy}
              onClick={() => setSide(OrderSide.Buy)}
            />
          </div>
          <div className="w-1/2 ml-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Sell}
              selected={side === OrderSide.Sell}
              onClick={() => setSide(OrderSide.Sell)}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="REDUCE ONLY"
            oneButton={true}
            value={reduceOnly}
            onChange={setReduceOnly}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="INFINITE CHASE"
            oneButton={true}
            value={infinite}
            onChange={setInfinite}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="STALK MODE"
            oneButton={true}
            value={stalk}
            onChange={setStalk}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div
          className={cx('mr-4 text-right font-bold w-1/4', {
            'opacity-20': infinite,
          })}
        >
          {stalk ? `Stalk distance` : `Distance limit`}
        </div>
        <div
          className={cx('flex flex-1 w-3/4', {
            'opacity-20': infinite,
          })}
        >
          <Range
            step={0.01}
            min={0.01}
            max={2}
            values={[limit]}
            disabled={infinite}
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
            onChange={(values) => setLimit(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {infinite ? `∞` : `${limit}%`}
        </div>
      </div>
      <div className="flex items-center my-4">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex-1 w-3/4 pr-1 text-dark-text-gray">
          <div className="flex items-center">
            <div className="font-semibold">Min price</div>
            <div className="ml-auto font-mono text-xs">
              {infinite || stalk ? `∞` : `$${min}`}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Max price</div>
            <div className="ml-auto font-mono text-xs">
              {infinite || stalk ? `∞` : `$${max}`}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-2 w-full">
        <ButtonComponent
          className="w-full bg-dark-bg flex items-center justify-center uppercase rounded-md"
          size="small"
          disabled={disabled}
          loading={loading}
          onClick={handleSubmit}
        >
          CHASE {side}
          {pFloat(size) > 0 && (
            <span className="font-mono text-xs ml-1">
              ({size} {symbol?.replace(tickerRegex, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

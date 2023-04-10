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
    <div className="h-full px-2 py-3 text-sm">
      {chases.length === 0 && (
        <p className="mb-3 rounded-md border-2 border-blue-500 bg-blue-500/10 p-1.5 font-bold text-blue-500">
          You need to keep this tab open and connected to this account, but you can change tickers
          and continue trading as usual.
        </p>
      )}
      {chases.length > 0 && (
        <div className="border-dark-bg bg-dark-bg/20 mb-3 rounded-md border-2 p-1.5">
          {chases.map(({ id, chase }) => (
            <ChaseRowComponent key={id} chase={chase} />
          ))}
        </div>
      )}
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Quantity</div>
        <div className="flex w-3/4 flex-1">
          <input
            type="text"
            value={size}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            onChange={(e) => handleChangeSize(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Size in USD</div>
        <div className="flex w-3/4 flex-1">
          <input
            type="text"
            value={sizeUSD}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            onChange={(e) => handleChangeSizeUSD(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Side</div>
        <div className="flex w-3/4">
          <div className="mr-1 w-1/2">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Buy}
              selected={side === OrderSide.Buy}
              onClick={() => setSide(OrderSide.Buy)}
            />
          </div>
          <div className="ml-1 w-1/2">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Sell}
              selected={side === OrderSide.Sell}
              onClick={() => setSide(OrderSide.Sell)}
            />
          </div>
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="REDUCE ONLY"
            oneButton={true}
            value={reduceOnly}
            onChange={setReduceOnly}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="INFINITE CHASE"
            oneButton={true}
            value={infinite}
            onChange={setInfinite}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="flex w-3/4">
          <ToggleInputComponent
            label="STALK MODE"
            oneButton={true}
            value={stalk}
            onChange={setStalk}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div
          className={cx('mr-4 w-1/4 text-right font-bold', {
            'opacity-20': infinite,
          })}
        >
          {stalk ? `Stalk distance` : `Distance limit`}
        </div>
        <div
          className={cx('flex w-3/4 flex-1', {
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
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={(values) => setLimit(values[0])}
          />
        </div>
        <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
          {infinite ? `∞` : `${limit}%`}
        </div>
      </div>
      <div className="my-4 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="text-dark-text-gray w-3/4 flex-1 pr-1">
          <div className="flex items-center">
            <div className="font-semibold">Min price</div>
            <div className="ml-auto font-mono text-xs">{infinite || stalk ? `∞` : `$${min}`}</div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Max price</div>
            <div className="ml-auto font-mono text-xs">{infinite || stalk ? `∞` : `$${max}`}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex w-full">
        <ButtonComponent
          className="bg-dark-bg flex w-full items-center justify-center rounded-md uppercase"
          size="small"
          disabled={disabled}
          loading={loading}
          onClick={handleSubmit}
        >
          CHASE {side}
          {pFloat(size) > 0 && (
            <span className="ml-1 font-mono text-xs">
              ({size} {symbol?.replace(tickerRegex, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

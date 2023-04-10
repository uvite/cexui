import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useAtom, useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { Range } from 'react-range';
import { OrderSide } from 'safe-cex/dist/types';

import { selectedAtom } from '../../../app-state';
import { privacyAtom } from '../../../atoms/app.atoms';
import {
  tradeReduceOnlyAtom,
  tradeSideAtom,
  twapRandomnessAtom,
  twapLengthAtom,
  twapLotsCountAtom,
  tradeSizeAtom,
  tradeSizeUSDAtom,
} from '../../../atoms/trade.atoms';
import { useTwapTrade } from '../../../hooks/trade/use-twap.hooks';
import { useSizeUSD } from '../../../hooks/use-size-usd.hooks';
import { floorStep } from '../../../utils/floor-step.utils';
import { pFloat } from '../../../utils/parse-float.utils';
import { tickerRegex } from '../../../utils/ticker-match/ticker-match.utils';
import { toUSD } from '../../../utils/to-usd.utils';
import { ButtonComponent } from '../../ui/button.component';
import { OrderSideButton } from '../../ui/order-side-button.component';
import { ToggleInputComponent } from '../../ui/toggle-input.component';

import { TwapRowComponent } from './twap-row.component';

dayjs.extend(duration);

export const TWAPOrderTradeComponent = () => {
  const privacy = useAtomValue(privacyAtom);

  const { symbol, market, ticker } = useAtomValue(selectedAtom);
  const { twaps, startTwap, pauseTwap, resumeTwap, stopTwap } = useTwapTrade();

  const [loading, setLoading] = useState(false);

  const [twapLength, setTwapLength] = useAtom(twapLengthAtom);
  const [side, setSide] = useAtom(tradeSideAtom);
  const [reduceOnly, setReduceOnly] = useAtom(tradeReduceOnlyAtom);
  const [lotsCount, setLotsCount] = useAtom(twapLotsCountAtom);
  const [randomness, setRandomness] = useAtom(twapRandomnessAtom);

  const { size, sizeUSD, handleChangeSize, handleChangeSizeUSD } = useSizeUSD({
    sizeAtom: tradeSizeAtom,
    sizeUSDAtom: tradeSizeUSDAtom,
  });

  const pAmt = market?.precision?.amount ?? 0;
  const minAmt = market?.limits?.amount?.min ?? 0;

  const lotSize = floorStep(pFloat(size) / lotsCount, pAmt);
  const orderFreq = twapLength / lotsCount;

  const disabled = loading || !size || !twapLength || minAmt === lotSize;

  const handleSubmit = async () => {
    setLoading(true);

    await startTwap({
      symbol,
      side,
      size: pFloat(size),
      reduceOnly,
      lotsCount,
      length: twapLength,
      randomness,
    });

    setLoading(false);
  };

  return (
    <div className="h-full px-2 py-3 text-sm">
      {twaps.length === 0 ? (
        <p className="mb-3 rounded-md border-2 border-blue-500 bg-blue-500/10 p-1.5 font-bold text-blue-500">
          You need to keep this tab open and connected to this account, but you can change tickers
          and continue trading as usual.
        </p>
      ) : (
        <div className="border-dark-bg bg-dark-bg/20 mb-3 rounded-md border-2 p-1.5">
          {twaps.map((twap) => (
            <TwapRowComponent
              key={twap.id}
              twap={twap}
              pause={pauseTwap}
              resume={resumeTwap}
              stop={stopTwap}
            />
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
        <div className="mr-4 w-1/4 text-right font-bold">Duration</div>
        <div className="flex w-3/4 flex-1">
          <Range
            step={10}
            min={10}
            max={60 * 12}
            values={[twapLength]}
            renderTrack={({ props, children }) => (
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={(values) => setTwapLength(values[0])}
          />
        </div>
        <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
          {dayjs.duration(twapLength, 'minutes').format(twapLength >= 60 ? 'HH[h]mm[m]' : 'mm[m]')}
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Total lots</div>
        <div className="flex w-3/4 flex-1">
          <Range
            step={1}
            min={2}
            max={100}
            values={[lotsCount]}
            renderTrack={({ props, children }) => (
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={(values) => setLotsCount(values[0])}
          />
        </div>
        <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
          {lotsCount}
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Randomness</div>
        <div className="flex w-3/4 flex-1">
          <Range
            step={0.01}
            min={0}
            max={0.2}
            values={[randomness]}
            renderTrack={({ props, children }) => (
              <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
            )}
            onChange={(values) => setRandomness(values[0])}
          />
        </div>
        <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
          ~{Math.round(randomness * 100)}%
        </div>
      </div>
      <div className="my-4 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="text-dark-text-gray w-3/4 flex-1 pr-1">
          <div className="flex items-center">
            <div className="font-semibold">Lot size</div>
            <div className="ml-auto font-mono text-xs">
              {privacy ? (
                '*****'
              ) : (
                <>
                  {lotSize && randomness > 0 ? '± ' : ''}
                  {lotSize ? `${lotSize} (${toUSD(lotSize * (ticker?.last ?? 0))})` : '-'}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Order freq.</div>
            <div className="ml-auto font-mono text-xs">
              {privacy ? (
                '*****'
              ) : (
                <>
                  {randomness > 0 && '± '}
                  {dayjs
                    .duration(orderFreq, 'minutes')
                    .format(orderFreq >= 60 ? 'HH[h] mm[m] ss[s]' : 'mm[m] ss[s]')}
                </>
              )}
            </div>
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
          TWAP {side}
          {pFloat(size) > 0 && (
            <span className="ml-2 font-mono text-xs">
              ({size} {symbol?.replace(tickerRegex, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
      {lotSize === minAmt && (
        <p className="mt-2 text-center font-bold text-red-500">
          Lot size is too small, please reduce the number of lots.
        </p>
      )}
    </div>
  );
};

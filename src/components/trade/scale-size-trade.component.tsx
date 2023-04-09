import cx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { Range } from 'react-range';
import { OrderSide } from 'safe-cex/dist/types';

import { selectedAtom } from '../../app-state';
import { privacyAtom } from '../../atoms/app.atoms';
import {
  tradeEntryTouchedAtom,
  tradeLastTouchedAtom,
  tradeSideAtom,
  nbOrdersAtom,
  priceScaleRatioAtom,
  LastTouchedInput,
  selectedSymbolAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
  tradeSizeAtom,
  tradeSizeUSDAtom,
} from '../../atoms/trade.atoms';
import {
  scaleFromAtom,
  scaleToAtom,
  scaleInSizeAtom,
  useScaledInSizeTrade,
  scaleSizeReduceOnlyAtom,
} from '../../hooks/trade/use-scale-size-trade.hooks';
import { useGetTickerPrice } from '../../hooks/use-ticker-price.hooks';
import { easeRatioToPercent } from '../../utils/ease-ratio-percent.utils';
import { floorStep } from '../../utils/floor-step.utils';
import { formatCurrency } from '../../utils/formatter.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { ButtonComponent } from '../ui/button.component';
import { OrderSideButton } from '../ui/order-side-button.component';
import { ToggleInputComponent } from '../ui/toggle-input.component';

export const ScaleSizeTradeComponent = () => {
  const selectedSymbol = useAtomValue(selectedSymbolAtom);
  const privacy = useAtomValue(privacyAtom);
  const currSymbol = useRef(selectedSymbol);

  const getTickerPrice = useGetTickerPrice();

  const { market } = useAtomValue(selectedAtom);
  const pAmt = market?.precision.amount ?? 0;

  const [loading, setLoading] = useState(false);

  const [size, setSize] = useAtom(tradeSizeAtom);
  const [sizeUSD, setSizeUSD] = useAtom(tradeSizeUSDAtom);
  const [sizeUSDTouched, setSizeUSDTouched] = useState(false);

  const [entryTouched, setEntryTouched] = useAtom(tradeEntryTouchedAtom);
  const [lastTouched, setLastTouched] = useAtom(tradeLastTouchedAtom);

  const [from, setFrom] = useAtom(scaleFromAtom);
  const [to, setTo] = useAtom(scaleToAtom);
  const [side, setSide] = useAtom(tradeSideAtom);
  const [nbOrders, setNbOrders] = useAtom(nbOrdersAtom);
  const [easeRatio, setEaseRatio] = useAtom(priceScaleRatioAtom);
  const [stop, setStop] = useAtom(tradeStopLossAtom);
  const [takeProfit, setTakeProfit] = useAtom(tradeTakeProfitAtom);
  const [reduceOnly, setReduceOnly] = useAtom(scaleSizeReduceOnlyAtom);

  const currPrice = getTickerPrice(selectedSymbol, side);
  const fromOrCurrentyPrice = entryTouched ? from : currPrice;

  const scaleIn = useScaledInSizeTrade();
  const { sizeInUSD, avgPrice, estLoss, estProfit } =
    useAtomValue(scaleInSizeAtom);

  const displayedSizeInUSD = sizeUSDTouched ? sizeUSD : sizeInUSD.toFixed(2);
  const disabled =
    !pFloat(to) ||
    !pFloat(fromOrCurrentyPrice) ||
    !pFloat(size) ||
    !nbOrders ||
    loading;

  const placeOrder = async () => {
    setLoading(true);

    try {
      await scaleIn();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedSymbol !== currSymbol.current) {
      setFrom('');
      setTo('');
      setSize('');
      setSizeUSD('');
      setSizeUSDTouched(false);
      setEntryTouched(false);
      currSymbol.current = selectedSymbol;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);

  const handleChangeSizeInUSD = (value: string) => {
    const rawSize = pFloat(value) / avgPrice;
    const flooredSize = floorStep(rawSize, pAmt);
    setSize(flooredSize.toString());
    setSizeUSD(value);
    setSizeUSDTouched(true);
  };

  const handleChangeQuantity = (value: string) => {
    setSize(value);
    setSizeUSD('');
    setSizeUSDTouched(false);
  };

  const handleChangeReduce = (value: boolean) => {
    setReduceOnly(value);

    if (value) {
      setStop('');
      setTakeProfit('');
    }
  };

  useEffect(() => {
    if (sizeUSDTouched && sizeUSD) {
      const rawSize = pFloat(sizeUSD) / avgPrice;
      const flooredSize = floorStep(rawSize, pAmt);
      setSize(isFinite(flooredSize) ? flooredSize.toString() : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avgPrice]);

  return (
    <div className="px-2 py-3 text-sm h-full">
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Quantity</div>
        <div className="flex flex-1 w-3/4">
          <input
            type="text"
            value={size}
            className={cx(
              'text-right w-full bg-dark-bg font-semibold font-mono',
              { 'border-pink-500/50': !sizeUSDTouched }
            )}
            onChange={(e) => handleChangeQuantity(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Size in USD</div>
        <div className="flex flex-1 w-3/4">
          <input
            type="text"
            value={displayedSizeInUSD || ''}
            className={cx(
              'text-right w-full bg-dark-bg font-semibold font-mono',
              { 'border-pink-500/50': sizeUSDTouched }
            )}
            onChange={(e) => handleChangeSizeInUSD(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-1/4 text-right font-bold">From</div>
        <div className="w-3/4 ml-auto pl-4 flex items-center">
          <div className="w-1/2 pr-8">
            <div className="flex items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={fromOrCurrentyPrice?.toString() || ''}
                  className={cx(
                    'text-right w-full bg-dark-bg font-semibold font-mono',
                    { 'border-blue-500': lastTouched === 'from' }
                  )}
                  onChange={(e) => setFrom(e.target.value)}
                  onFocus={() => {
                    setLastTouched(LastTouchedInput.From);
                    setEntryTouched(true);
                  }}
                />
              </div>
              <div className="ml-2">
                <button
                  type="button"
                  className={cx(
                    'flex items-center justify-center font-bold border-2 rounded-md text-xs px-2 h-[32px] bg-slate-500/50 border-slate-500',
                    {
                      'opacity-30 cursor-not-allowed': !entryTouched,
                      'cursor-pointer': entryTouched,
                    }
                  )}
                  onClick={() => {
                    setEntryTouched(false);
                    setFrom('');
                  }}
                >
                  LAST
                </button>
              </div>
            </div>
          </div>
          <div className="w-1/2">
            <div className="flex items-center">
              <div className="text-right font-bold mr-4">To</div>
              <input
                type="text"
                value={to}
                className={cx(
                  'text-right w-full bg-dark-bg font-semibold font-mono',
                  { 'border-blue-500': lastTouched === 'to' }
                )}
                onChange={(e) => setTo(e.target.value)}
                onFocus={() => setLastTouched(LastTouchedInput.To)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-1/4 text-right font-bold">SL</div>
        <div className="w-3/4 ml-auto pl-4 flex items-center">
          <div className="w-1/2 pr-8">
            <input
              type="text"
              value={stop}
              className={cx(
                'text-right w-full bg-dark-bg font-semibold font-mono',
                { 'border-blue-500': lastTouched === 'stopLoss' }
              )}
              required={true}
              disabled={reduceOnly}
              onChange={({ target }) => setStop(target.value)}
              onFocus={() => setLastTouched(LastTouchedInput.StopLoss)}
            />
          </div>
          <div className="w-1/2">
            <div className="flex items-center">
              <div className="text-right font-bold mr-4">TP</div>
              <input
                type="text"
                value={takeProfit}
                className={cx(
                  'text-right w-full bg-dark-bg font-semibold font-mono',
                  { 'border-blue-500': lastTouched === 'takeProfit' }
                )}
                required={true}
                disabled={reduceOnly}
                onChange={({ target }) => setTakeProfit(target.value)}
                onFocus={() => setLastTouched(LastTouchedInput.TakeProfit)}
              />
            </div>
          </div>
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
            onChange={handleChangeReduce}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Distribution</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={0.05}
            min={1}
            max={3}
            values={[easeRatio]}
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
            onChange={(values) => setEaseRatio(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {easeRatioToPercent(easeRatio)}
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Orders Count</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={1}
            min={2}
            max={35}
            values={[nbOrders]}
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
            onChange={(values) => setNbOrders(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {nbOrders}
        </div>
      </div>
      <div className="flex items-center my-6">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex-1 w-3/4 pr-1 text-dark-text-gray">
          <div className="flex items-center">
            <div className="font-semibold">Size</div>
            <div className="ml-auto font-mono text-xs">
              {formatCurrency(sizeInUSD, 'usd')}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Avg price</div>
            <div className="ml-auto font-mono text-xs">
              {formatCurrency(avgPrice, 'usd')}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Est. loss</div>
            <div className="ml-auto font-mono text-xs">
              {privacy
                ? '***'
                : (estLoss && formatCurrency(estLoss, 'usd')) || '-'}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Est. profit</div>
            <div className="ml-auto font-mono text-xs">
              {privacy
                ? '***'
                : (estProfit && formatCurrency(Math.abs(estProfit), 'usd')) ||
                  '-'}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-3 w-full">
        <ButtonComponent
          className="w-full bg-dark-bg flex items-center justify-center uppercase rounded-md"
          size="small"
          disabled={disabled}
          loading={loading}
          onClick={placeOrder}
        >
          {side}
          {pFloat(size) > 0 && (
            <span className="font-mono text-xs ml-2">
              ({size} {selectedSymbol?.replace(/\/.+/, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

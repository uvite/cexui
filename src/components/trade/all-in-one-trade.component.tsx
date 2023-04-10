import cx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { OrderSide } from 'safe-cex/dist/types';

import {
  tradeSideAtom,
  tradeLastTouchedAtom,
  LastTouchedInput,
  selectedSymbolAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
} from '../../atoms/trade.atoms';
import {
  aioOrderSubTypes,
  aioOrderTypes,
  aioSelectedOrderSubTypeAtom,
  aioSelectedOrderTypeAtom,
  aioSelectedSizeAtom,
  aioTradeAtom,
  aioTradesSizesAtom,
  useAIOTrade,
} from '../../hooks/trade/use-aio-trade.hooks';
import { errorToast } from '../../notifications/error.toast';
import { toUSD } from '../../utils/to-usd.utils';
import { ActionButtonComponent, ButtonComponent } from '../ui/button.component';
import { OrderSideButton } from '../ui/order-side-button.component';

export const AllInOneTradeComponent = () => {
  const [loading, setLoading] = useState(false);

  const selectedSymbol = useAtomValue(selectedSymbolAtom);
  const currSymbol = useRef(selectedSymbol);

  const sizes = useAtomValue(aioTradesSizesAtom);

  const [selectedSize, setSelectedSize] = useAtom(aioSelectedSizeAtom);
  const [orderType, setOrderType] = useAtom(aioSelectedOrderTypeAtom);
  const [orderSubType, setOrderSubType] = useAtom(aioSelectedOrderSubTypeAtom);
  const [side, setSide] = useAtom(tradeSideAtom);
  const [stop, setStop] = useAtom(tradeStopLossAtom);
  const [takeProfit, setTakeProfit] = useAtom(tradeTakeProfitAtom);
  const setLastTouched = useSetAtom(tradeLastTouchedAtom);

  const { totalQuantity, estimatedLoss, estimatedProfit, price } = useAtomValue(aioTradeAtom);

  const trade = useAIOTrade();

  const placeOrder = async () => {
    if (!loading) {
      setLoading(true);

      try {
        await trade();
      } catch (error: any) {
        errorToast(error?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedSymbol !== currSymbol.current) {
      setStop('');
      setTakeProfit('');
      setLastTouched(null);
      currSymbol.current = selectedSymbol;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);

  return (
    <div className="h-full px-2 py-3 text-sm">
      <div className="mb-4 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Side</div>
        <div className="flex w-3/4 flex-1">
          <div className="mr-1 w-1/2">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Buy}
              selected={side === OrderSide.Buy}
              onClick={setSide}
            />
          </div>
          <div className="ml-1 w-1/2">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Sell}
              selected={side === OrderSide.Sell}
              onClick={setSide}
            />
          </div>
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Size</div>
        <div className="flex w-3/4 flex-wrap">
          {sizes.map(({ value, label }, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={idx} className="mb-2 w-1/2 odd:pl-1 odd:pr-1 even:pl-1">
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'border-dark-blue opacity-100': selectedSize === value,
                })}
                onClick={() => setSelectedSize(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Order</div>
        <div className="flex flex-1 items-center">
          {aioOrderTypes.map(({ value, label }) => (
            <div
              key={value}
              className={`w-1/${aioOrderTypes.length} pl-1 pr-1 first:pl-0 last:pr-0`}
            >
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'border-dark-blue opacity-100': orderType === value,
                })}
                onClick={() => setOrderType(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Opts</div>
        <div className="flex flex-1 items-center">
          {aioOrderSubTypes[orderType].map(({ value, label }) => (
            <div
              key={value}
              className={`w-1/${aioOrderSubTypes[orderType].length} pl-1 pr-1 first:pl-0 last:pr-0`}
            >
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'border-dark-blue opacity-100': orderSubType === value,
                })}
                onClick={() => setOrderSubType(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">SL</div>
        <div className="w-3/4">
          <input
            type="text"
            value={stop}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            required={true}
            onChange={({ target }) => setStop(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.To)}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">TP</div>
        <div className="w-3/4">
          <input
            type="text"
            value={takeProfit}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            required={true}
            onChange={({ target }) => setTakeProfit(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.TakeProfit)}
          />
        </div>
      </div>
      <div className="my-6 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold" />
        <div className="text-dark-text-gray w-3/4 flex-1 pr-1">
          <div className="flex items-center">
            <div className="font-semibold">Quantity</div>
            <div className="ml-auto font-mono text-xs">{totalQuantity}</div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Avg. price</div>
            <div className="ml-auto font-mono text-xs">{toUSD(price)}</div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Est. loss</div>
            <div className="ml-auto font-mono text-xs">
              {estimatedLoss ? toUSD(estimatedLoss) : '-'}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Est. profit</div>
            <div className="ml-auto font-mono text-xs">
              {estimatedProfit ? toUSD(estimatedProfit) : '-'}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex w-full">
        <ButtonComponent
          className="bg-dark-bg flex w-full items-center justify-center rounded-md"
          size="small"
          disabled={totalQuantity === 0}
          loading={loading}
          onClick={placeOrder}
        >
          {side}
          {totalQuantity > 0 && (
            <span className="ml-2 font-mono text-xs">
              ({totalQuantity} {selectedSymbol?.replace(/\/.+/, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

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

  const { totalQuantity, estimatedLoss, estimatedProfit, price } =
    useAtomValue(aioTradeAtom);

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
    <div className="px-2 py-3 text-sm h-full">
      <div className="flex items-center mb-4">
        <div className="mr-4 text-right font-bold w-1/4">Side</div>
        <div className="flex flex-1 w-3/4">
          <div className="w-1/2 mr-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Buy}
              selected={side === OrderSide.Buy}
              onClick={setSide}
            />
          </div>
          <div className="w-1/2 ml-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Sell}
              selected={side === OrderSide.Sell}
              onClick={setSide}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Size</div>
        <div className="w-3/4 flex flex-wrap">
          {sizes.map(({ value, label }, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={idx} className="w-1/2 odd:pr-1 odd:pl-1 even:pl-1 mb-2">
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'opacity-100 border-dark-blue': selectedSize === value,
                })}
                onClick={() => setSelectedSize(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Order</div>
        <div className="flex flex-1 items-center">
          {aioOrderTypes.map(({ value, label }) => (
            <div
              key={value}
              className={`w-1/${aioOrderTypes.length} pl-1 pr-1 first:pl-0 last:pr-0`}
            >
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'opacity-100 border-dark-blue': orderType === value,
                })}
                onClick={() => setOrderType(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="mr-4 text-right font-bold w-1/4">Opts</div>
        <div className="flex flex-1 items-center">
          {aioOrderSubTypes[orderType].map(({ value, label }) => (
            <div
              key={value}
              className={`w-1/${aioOrderSubTypes[orderType].length} pl-1 pr-1 first:pl-0 last:pr-0`}
            >
              <ActionButtonComponent
                className={cx('bg-dark-bg w-full rounded-md', {
                  'opacity-100 border-dark-blue': orderSubType === value,
                })}
                onClick={() => setOrderSubType(value)}
              >
                {label}
              </ActionButtonComponent>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">SL</div>
        <div className="w-3/4">
          <input
            type="text"
            value={stop}
            className="text-right w-full bg-dark-bg font-semibold font-mono"
            required={true}
            onChange={({ target }) => setStop(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.To)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">TP</div>
        <div className="w-3/4">
          <input
            type="text"
            value={takeProfit}
            className="text-right w-full bg-dark-bg font-semibold font-mono"
            required={true}
            onChange={({ target }) => setTakeProfit(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.TakeProfit)}
          />
        </div>
      </div>
      <div className="flex items-center my-6">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex-1 w-3/4 pr-1 text-dark-text-gray">
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
      <div className="flex mt-3 w-full">
        <ButtonComponent
          className="w-full bg-dark-bg flex items-center justify-center rounded-md"
          size="small"
          disabled={totalQuantity === 0}
          loading={loading}
          onClick={placeOrder}
        >
          {side}
          {totalQuantity > 0 && (
            <span className="font-mono text-xs ml-2">
              ({totalQuantity} {selectedSymbol?.replace(/\/.+/, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

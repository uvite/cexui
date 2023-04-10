/* eslint-disable complexity */
import cx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { Range } from 'react-range';
import type { PlaceOrderOpts } from 'safe-cex/dist/types';
import { OrderSide, OrderType } from 'safe-cex/dist/types';

import { selectedAtom } from '../../app-state';
import {
  fatFingerValueAtom,
  LastTouchedInput,
  maxMarketSlippageAtom,
  tradeEntryTouchedAtom,
  tradeLastTouchedAtom,
  tradeSizeAtom,
  tradeSizeUSDAtom,
} from '../../atoms/trade.atoms';
import {
  selectedSimpleTradeAtom,
  simpleTradeEntryAtom,
  simpleTradeReduceOnlyAtom,
  simpleOrdersTradeAtom,
} from '../../hooks/trade/use-simple-orders-trade.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { ConnectorContext } from '../../hooks/use-exchange-connector.hooks';
import { useLogOrder } from '../../hooks/use-log-order.hooks';
import { errorToast } from '../../notifications/error.toast';
import { fatFingerError } from '../../utils/errors.utils';
import { floorStep } from '../../utils/floor-step.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { ActionButtonComponent } from '../ui/button.component';
import { ToggleInputComponent } from '../ui/toggle-input.component';

const types: Array<[OrderType, string]> = [
  [OrderType.Limit, 'Limit'],
  [OrderType.Market, 'Market'],
  [OrderType.StopLoss, 'Stop Loss'],
  [OrderType.TakeProfit, 'Take Profit'],
];

const submitLabels = {
  [OrderSide.Buy]: {
    [OrderType.Limit]: 'buy / long',
    [OrderType.Market]: 'buy / long',
    [OrderType.StopLoss]: 'stop buy',
    [OrderType.TakeProfit]: 'tp buy',
    [OrderType.TrailingStopLoss]: 'trailing stop buy',
  },
  [OrderSide.Sell]: {
    [OrderType.Limit]: 'sell / short',
    [OrderType.Market]: 'sell / short',
    [OrderType.StopLoss]: 'stop sell',
    [OrderType.TakeProfit]: 'tp sell',
    [OrderType.TrailingStopLoss]: 'trailing stop sell',
  },
};

export const TradeSimpleOrdersComponent = () => {
  const track = useAnalytics();
  const connector = useContext(ConnectorContext);

  const logOrder = useLogOrder();
  const fatFinger = useAtomValue(fatFingerValueAtom);

  const [loading, setLoading] = useState(false);
  const [trailing, setTrailing] = useState(false);

  const [sizeUSDTouched, setSizeUSDTouched] = useState(false);
  const [sizeUSD, setSizeUSD] = useAtom(tradeSizeUSDAtom);

  const [isEntryTouched, setEntryTouched] = useAtom(tradeEntryTouchedAtom);
  const setEntry = useSetAtom(simpleTradeEntryAtom);

  const [type, setSelected] = useAtom(selectedSimpleTradeAtom);
  const [size, setSize] = useAtom(tradeSizeAtom);
  const [reduceOnly, setReduceOnly] = useAtom(simpleTradeReduceOnlyAtom);
  const [lastTouched, setLastTouched] = useAtom(tradeLastTouchedAtom);
  const [maxSlippage, setMaxSlippage] = useAtom(maxMarketSlippageAtom);

  const { symbol, ticker, market } = useAtomValue(selectedAtom);

  const calcSize = (pFloat(size) ?? 0) * (ticker?.last ?? 0);
  const calcSizeOrEmptyString = calcSize > 0 ? calcSize.toFixed(2) : '';
  const displayedSizeInUSD = sizeUSDTouched ? sizeUSD : calcSizeOrEmptyString;

  const { buySize, sellSize, disabledBuy, disabledSell, isTPOrSL, price } =
    useAtomValue(simpleOrdersTradeAtom);

  const disabled = (!isTPOrSL && !size) || !price || loading;

  const handleTypechange = (value: OrderType) => {
    setSelected(value);
    setEntryTouched(false);
    setEntry('');
    setSize('');
    setSizeUSD('');
    setSizeUSDTouched(false);
    setReduceOnly(false);
  };

  const handleChangeQuantity = (value: string) => {
    setSize(value);
    setSizeUSD('');
    setSizeUSDTouched(false);
  };

  const handleChangeSizeInUSD = (value: string) => {
    const amount = floorStep(pFloat(value) / (ticker?.last || 1), market?.precision?.amount ?? 0);

    setSize(amount.toString());
    setSizeUSD(value);
    setSizeUSDTouched(true);
  };

  const handleSubmit = (side: OrderSide) => async () => {
    if (loading || !connector || !ticker) return;

    const amount = pFloat(side === OrderSide.Buy ? buySize : sellSize);

    if (Number.isNaN(amount) || amount <= 0) {
      errorToast('Invalid quantity');
      return;
    }

    if (type !== OrderType.Market && Number.isNaN(pFloat(price))) {
      errorToast('Invalid price');
      return;
    }

    if (
      (type === OrderType.Market || type === OrderType.Limit) &&
      fatFinger &&
      pFloat(displayedSizeInUSD) > fatFinger
    ) {
      fatFingerError();
      return;
    }

    const orderType = type === OrderType.StopLoss && trailing ? OrderType.TrailingStopLoss : type;

    const order: PlaceOrderOpts = {
      symbol,
      side,
      type: orderType,
      reduceOnly,
      amount,
      price: type === OrderType.Market ? undefined : pFloat(price),
    };

    if (type === OrderType.Market && maxSlippage > 0) {
      const priceDistance = (maxSlippage * ticker.last) / 100;
      const orderPrice =
        side === OrderSide.Buy ? ticker.last + priceDistance : ticker.last - priceDistance;

      order.type = OrderType.Limit;
      order.price = orderPrice;
    }

    try {
      setLoading(true);
      logOrder(order);

      const orderIds = await connector.placeOrder(order);

      if (
        orderIds.length > 0 &&
        (order.type === OrderType.Limit || order.type === OrderType.Market)
      ) {
        track(EventName.Trade, {
          from: 'simple',
          order: {
            symbol: order.symbol,
            side: order.side,
            price: order.price || pFloat(price || 0),
            amount: order.amount,
            reduceOnly: order.reduceOnly,
          },
        });
      }

      handleTypechange(type);
    } finally {
      // reset form
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => handleTypechange(types[0][0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full px-2 py-3 text-sm">
      <div className="mb-4 grid grid-cols-2 gap-1">
        {types.map(([newType, label]) => (
          <ActionButtonComponent
            key={newType}
            className={cx('bg-dark-bg rounded-md uppercase', {
              'border-blue-300 text-blue-300 opacity-100': newType === type,
            })}
            onClick={() => handleTypechange(newType)}
          >
            {label}
          </ActionButtonComponent>
        ))}
      </div>
      {isTPOrSL && disabledBuy && disabledSell && (
        <div className="mb-4 rounded-md border-2 border-orange-500 py-2 text-center font-bold text-orange-500">
          You need to have an open position to use this order type
        </div>
      )}
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Price</div>
        <div className="flex w-3/4 flex-1 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={price || ''}
              className={cx('bg-dark-bg w-full text-right font-mono font-semibold', {
                'border-blue-500': lastTouched === 'entry' && type !== OrderType.Market,
              })}
              disabled={type === OrderType.Market}
              onFocus={() => {
                setLastTouched(LastTouchedInput.Entry);
                setEntryTouched(true);
              }}
              onChange={(e) => {
                setEntry(e.target.value);
              }}
            />
          </div>
          <div className="ml-2">
            <button
              type="button"
              className={cx(
                'flex h-[32px] items-center justify-center rounded-md border-2 border-slate-500 bg-slate-500/50 px-2 text-xs font-bold',
                {
                  'cursor-not-allowed opacity-30': !isEntryTouched,
                  'cursor-pointer': isEntryTouched,
                },
              )}
              onClick={() => {
                setEntryTouched(false);
                setEntry('');
              }}
            >
              LAST
            </button>
          </div>
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Quantity</div>
        <div className="flex w-3/4 flex-1">
          <input
            type="text"
            value={size}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            disabled={[OrderType.StopLoss, OrderType.TakeProfit].includes(type)}
            onChange={(e) => handleChangeQuantity(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-2 flex items-center">
        <div className="mr-4 w-1/4 text-right font-bold">Size in USD</div>
        <div className="flex w-3/4 flex-1">
          <input
            type="text"
            value={displayedSizeInUSD || ''}
            className="bg-dark-bg w-full text-right font-mono font-semibold"
            disabled={[OrderType.StopLoss, OrderType.TakeProfit].includes(type)}
            onChange={(e) => handleChangeSizeInUSD(e.target.value)}
          />
        </div>
      </div>
      {type === OrderType.Market && (
        <div className="mb-2 flex items-center">
          <div className="mr-4 w-1/4 text-right font-bold">Max slippage</div>
          <div className="flex w-3/4 flex-1">
            <Range
              step={0.05}
              min={0}
              max={5}
              values={[maxSlippage]}
              renderTrack={({ props, children }) => (
                <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
              )}
              onChange={(values) => setMaxSlippage(values[0])}
            />
          </div>
          <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
            {maxSlippage > 0 ? `${maxSlippage.toFixed(2)}%` : `∞`}
          </div>
        </div>
      )}
      {!isTPOrSL && (
        <div className="mb-2 flex items-center">
          <div className="mr-4 w-1/4 text-right font-bold" />
          <div className="flex w-3/4 flex-1">
            <ToggleInputComponent
              label="REDUCE ONLY"
              oneButton={true}
              value={reduceOnly}
              onChange={setReduceOnly}
            />
          </div>
        </div>
      )}
      {type === OrderType.StopLoss && (
        <div className="mb-2 flex items-center">
          <div className="mr-4 w-1/4 text-right font-bold" />
          <div className="flex w-3/4 flex-1">
            <ToggleInputComponent
              label="TRAILING STOP"
              oneButton={true}
              value={trailing}
              onChange={setTrailing}
            />
          </div>
        </div>
      )}
      <div className="mt-4 flex">
        <div className="w-1/4" />
        <div className="ml-6 grid w-3/4 grid-cols-2 gap-2">
          <ActionButtonComponent
            className="text-dark-white border-dark-green bg-dark-green/50 rounded-md"
            disabled={disabled || disabledBuy}
            onClick={handleSubmit(OrderSide.Buy)}
          >
            <div className="uppercase">{submitLabels[OrderSide.Buy][type]}</div>
            <div className="bg-dark-text-white my-1 h-[1px]" />
            <div className="font-mono">
              {buySize || '0.00'} @ {price || '0.00'}
            </div>
          </ActionButtonComponent>
          <ActionButtonComponent
            className="text-dark-white rounded-md border-red-500 bg-red-500/50"
            disabled={disabled || disabledSell}
            onClick={handleSubmit(OrderSide.Sell)}
          >
            <div className="uppercase">{submitLabels[OrderSide.Sell][type]}</div>
            <div className="bg-dark-text-white my-1 h-[1px]" />
            <div className="font-mono">
              {sellSize || '0.00'} @ {price || '0.00'}
            </div>
          </ActionButtonComponent>
        </div>
      </div>
    </div>
  );
};

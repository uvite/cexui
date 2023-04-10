import cx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { memo } from 'react';
import type { Order } from 'safe-cex/dist/types';
import { OrderType } from 'safe-cex/dist/types';

import { privacyAtom } from '../../atoms/app.atoms';
import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import { useCancelOrders } from '../../hooks/use-cancel-orders.hooks';
import { getTokenURL } from '../../utils/token-image.utils';
import { SmallActionButtonComponent } from '../ui/button.component';

import { OrdersEditInputComponent } from './orders-edit-input.component';

const getOrderLabel = (order: Order) => {
  if (order.type === OrderType.TakeProfit) return 'TP';
  if (order.type === OrderType.StopLoss) return 'SL';
  if (order.type === OrderType.TrailingStopLoss) return 'TSL';
  return order.side?.toUpperCase();
};

// eslint-disable-next-line react/display-name
export const OrderRowComponent = memo(({ order }: { order: Order }) => {
  const setSelectedSymbol = useSetAtom(selectedSymbolAtom);
  const privacy = useAtomValue(privacyAtom);
  const cancelOrders = useCancelOrders();

  const label = getOrderLabel(order);
  const symbol = order.symbol.replace(/USDT$|BUSD$/g, '');

  const isPositionSize =
    order.type === OrderType.StopLoss ||
    order.type === OrderType.TakeProfit ||
    order.type === OrderType.TrailingStopLoss;

  return (
    <>
      <td>
        <div
          className="flex min-w-[90px] cursor-pointer items-center py-[8px]"
          onClick={() => setSelectedSymbol(order.symbol)}
        >
          <span className="h-[16px] w-[16px] overflow-hidden rounded-full">
            <img alt={symbol} height={16} width={16} src={getTokenURL(order.symbol)} />
          </span>
          <span className="ml-2 text-xs font-bold">{symbol}</span>
        </div>
      </td>
      <td>
        <span
          className={cx('rounded-sm border-2 p-[3px] font-mono text-[10px] font-bold', {
            'border-red-500': order.side === 'sell',
            'border-dark-green': order.side === 'buy',
          })}
        >
          {label} {order.reduceOnly ? '(R)' : ''}
        </span>
      </td>
      <td className="text-right font-mono text-xs font-semibold">
        {order.type === OrderType.TrailingStopLoss ? (
          <span>{order.price}</span>
        ) : (
          <OrdersEditInputComponent order={order} type="price" />
        )}
      </td>
      <td className="text-right font-mono text-xs font-semibold">
        {privacy && '******'}
        {isPositionSize && !privacy && '-'}
        {!isPositionSize && !privacy && <OrdersEditInputComponent order={order} type="amount" />}
      </td>
      <td className="text-right">
        <SmallActionButtonComponent
          className="border-2 border-red-500 text-red-500"
          onClick={() => cancelOrders([order])}
        >
          x
        </SmallActionButtonComponent>
      </td>
    </>
  );
});

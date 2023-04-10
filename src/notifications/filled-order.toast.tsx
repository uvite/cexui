import React from 'react';
import { toast } from 'react-toastify';
import type { OrderFillEvent } from 'safe-cex/dist/types';
import { OrderSide } from 'safe-cex/dist/types';

import { playOrderFilledSound } from '../sounds';

export const filledOrderToast = (order: OrderFillEvent, isMuted: boolean) => {
  toast(
    <div className="font-mono text-sm">
      {order.side === OrderSide.Buy ? 'Bought' : 'Sold'}{' '}
      <span className="font-semibold">
        {order.amount} {order.symbol.replace(/USDT$|BUSD$/, '')}
      </span>{' '}
      @ <span className="font-semibold">${order.price}</span>
    </div>,
    {
      type: 'success',
      onOpen: () => !isMuted && playOrderFilledSound(),
    },
  );
};

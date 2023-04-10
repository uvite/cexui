import React from 'react';
import { toast } from 'react-toastify';
import type { UpdateOrderOpts } from 'safe-cex/dist/types';
import { OrderType } from 'safe-cex/dist/types';

const labels: Record<string, any> = {
  [OrderType.Limit]: 'Order',
  [OrderType.StopLoss]: 'Stop loss',
  [OrderType.TakeProfit]: 'Take profit',
};

export const updatedOrderToast = (opts: UpdateOrderOpts) => {
  const [key, value] = Object.entries(opts.update)[0];

  toast(
    <div className="font-mono text-sm">
      {labels[opts.order.type]}:<br /> <span className="capitalize">{key}</span> updated to{' '}
      <strong>
        {key === 'price' ? '$' : ''}
        {value}
      </strong>
    </div>,
    {
      type: 'success',
    },
  );
};

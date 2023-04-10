import cx from 'clsx';
import React from 'react';
import { OrderSide } from 'safe-cex/dist/types';

export const OrderSideButton = ({
  selected,
  side,
  onClick,
  label = side,
  className,
}: {
  selected: boolean;
  side: OrderSide;
  onClick: (side: OrderSide) => void;
  label?: string;
  className?: string;
}) => {
  return (
    <button
      type="button"
      className={cx(
        className,
        'flex cursor-pointer items-center justify-center rounded-md border-2 px-2 font-bold uppercase transition-opacity hover:opacity-100',
        {
          'opacity-100': selected,
          'opacity-30': !selected,
          'bg-dark-green/50 border-dark-green': side === OrderSide.Buy,
          'border-red-500 bg-red-500/50': side === OrderSide.Sell,
        },
      )}
      onClick={() => onClick(side)}
    >
      {label}
    </button>
  );
};

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
        'flex items-center justify-center font-bold uppercase border-2 rounded-md hover:opacity-100 transition-opacity cursor-pointer px-2',
        {
          'opacity-100': selected,
          'opacity-30': !selected,
          'bg-dark-green/50 border-dark-green': side === OrderSide.Buy,
          'bg-red-500/50 border-red-500': side === OrderSide.Sell,
        }
      )}
      onClick={() => onClick(side)}
    >
      {label}
    </button>
  );
};

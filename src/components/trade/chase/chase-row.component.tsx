import cx from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { OrderSide } from 'safe-cex/dist/types';

import { privacyAtom } from '../../../atoms/app.atoms';
import type { ChaseManager } from '../../../hooks/trade/use-chase.hooks';
import { tickerRegex } from '../../../utils/ticker-match/ticker-match.utils';

export const ChaseRowComponent = ({ chase }: { chase: ChaseManager }) => {
  const privacy = useAtomValue(privacyAtom);

  return (
    <div className="flex items-center h-[20px] mb-1.5 last:mb-0">
      <div
        className={cx('h-full w-[4px]', {
          'bg-red-500': chase.opts.side === OrderSide.Sell,
          'bg-dark-green': chase.opts.side === OrderSide.Buy,
        })}
      />
      <div className="font-bold ml-2 flex items-center">
        <span>{chase.opts.symbol.replace(tickerRegex, '')}</span>
        {chase.opts.stalk && <span className="text-xs ml-1">[STALK]</span>}
        {chase.opts.max === Infinity && !chase.opts.stalk && (
          <span className="text-xs ml-1">[INFINITE]</span>
        )}
      </div>
      <div className="flex-1 text-center font-mono font-bold animate-pulse">
        {privacy ? '*****' : `${chase.opts.size} @ $${chase.price}`}
      </div>
      <div className="ml-auto">
        <span
          className="text-red-500 cursor-pointer"
          onClick={() => chase.stop()}
        >
          <FaTimes />
        </span>
      </div>
    </div>
  );
};

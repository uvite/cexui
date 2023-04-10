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
    <div className="mb-1.5 flex h-[20px] items-center last:mb-0">
      <div
        className={cx('h-full w-[4px]', {
          'bg-red-500': chase.opts.side === OrderSide.Sell,
          'bg-dark-green': chase.opts.side === OrderSide.Buy,
        })}
      />
      <div className="ml-2 flex items-center font-bold">
        <span>{chase.opts.symbol.replace(tickerRegex, '')}</span>
        {chase.opts.stalk && <span className="ml-1 text-xs">[STALK]</span>}
        {chase.opts.max === Infinity && !chase.opts.stalk && (
          <span className="ml-1 text-xs">[INFINITE]</span>
        )}
      </div>
      <div className="flex-1 animate-pulse text-center font-mono font-bold">
        {privacy ? '*****' : `${chase.opts.size} @ $${chase.price}`}
      </div>
      <div className="ml-auto">
        <span className="cursor-pointer text-red-500" onClick={() => chase.stop()}>
          <FaTimes />
        </span>
      </div>
    </div>
  );
};

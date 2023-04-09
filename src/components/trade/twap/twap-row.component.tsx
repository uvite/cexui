import cx from 'clsx';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import React from 'react';
import { BiPause, BiPlay, BiStop } from 'react-icons/bi';
import { OrderSide } from 'safe-cex/dist/types';

import { marketsAtom } from '../../../app-state';
import { privacyAtom } from '../../../atoms/app.atoms';
import type { TWAPState } from '../../../hooks/trade/use-twap.hooks';
import { TWAPStatus } from '../../../hooks/trade/use-twap.hooks';
import { afterDecimal } from '../../../utils/after-decimal.utils';
import { floorStep } from '../../../utils/floor-step.utils';
import { tickerRegex } from '../../../utils/ticker-match/ticker-match.utils';

export const TwapRowComponent = ({
  twap,
  pause,
  resume,
  stop,
}: {
  twap: TWAPState & { id: string };
  pause: (id: string) => void;
  resume: (id: string) => void;
  stop: (id: string) => void;
}) => {
  const privacy = useAtomValue(privacyAtom);

  const markets = useAtomValue(marketsAtom);
  const market = markets.find((m) => m.symbol === twap.symbol);

  const remainingTime = dayjs(twap.nextOrderAt).diff(dayjs(), 'milliseconds');
  const executedSize = floorStep(
    twap.sizeExecuted,
    market?.precision?.amount ?? 0
  );

  const decimalsCount = afterDecimal(market?.precision?.price || 0);

  let format = 'hh[h] mm[m] ss[s]';
  if (remainingTime < 1000 * 60) {
    format = 'ss[s]';
  } else if (remainingTime < 1000 * 60 * 60) {
    format = 'mm[m] ss[s]';
  }

  return (
    <div className="flex items-center h-[20px] mb-1.5 last:mb-0">
      <div
        className={cx('h-full w-[4px]', {
          'bg-red-500': twap.side === OrderSide.Sell,
          'bg-dark-green': twap.side === OrderSide.Buy,
        })}
      />
      <div className="font-bold ml-2">
        {twap.symbol.replace(tickerRegex, '')}
      </div>
      <div className="font-mono font-bold text-xs flex-1 text-center">
        {privacy
          ? '*****'
          : `${executedSize}/${twap.size.toFixed(decimalsCount)}`}
      </div>
      <div className="flex items-center ml-auto">
        <div className="font-mono text-xs">
          {privacy ? '*****' : `${twap.lotsExecuted}/${twap.lotsCount}`}
        </div>
        {twap.status === TWAPStatus.Running && (
          <div className="ml-2 font-mono text-xs">
            ({dayjs.duration(remainingTime, 'milliseconds').format(format)})
          </div>
        )}
        <div className="text-lg flex items-center ml-3">
          {twap.status === TWAPStatus.Running && (
            <span
              className="text-yellow-500 cursor-pointer"
              onClick={() => pause(twap.id)}
            >
              <BiPause />
            </span>
          )}
          {twap.status === TWAPStatus.Paused && (
            <span
              className="text-dark-green cursor-pointer"
              onClick={() => resume(twap.id)}
            >
              <BiPlay />
            </span>
          )}
          <span
            className="text-red-500 cursor-pointer"
            onClick={() => stop(twap.id)}
          >
            <BiStop />
          </span>
        </div>
      </div>
    </div>
  );
};

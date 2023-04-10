import cx from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';

import { latencyAtom } from '../../app-state';
import { selectedAccountAtom, exchangesLogo } from '../../hooks/use-accounts.hooks';

export const NavbarLatencyComponent = () => {
  const account = useAtomValue(selectedAccountAtom);
  const latency = useAtomValue(latencyAtom);

  if (account && latency) {
    return (
      <div className="flex">
        <div className="bg-dark-border-gray mx-4 h-[45px] w-[1px]" />
        <div className="flex flex-col items-center justify-center">
          <img alt="exchange-logo" src={exchangesLogo[account.exchange]} width={50} />
          <div
            className={cx('mt-2 text-center font-mono text-xs', {
              'text-dark-text-gray': latency < 250,
              'text-orange-500': latency >= 250 && latency < 500,
              'text-red-500': latency >= 500,
            })}
          >
            {latency.toFixed()}ms
          </div>
        </div>
      </div>
    );
  }

  return null;
};

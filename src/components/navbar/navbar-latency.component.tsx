import cx from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';

import { latencyAtom } from '../../app-state';
import {
  selectedAccountAtom,
  exchangesLogo,
} from '../../hooks/use-accounts.hooks';

export const NavbarLatencyComponent = () => {
  const account = useAtomValue(selectedAccountAtom);
  const latency = useAtomValue(latencyAtom);

  if (account && latency) {
    return (
      <div className="flex">
        <div className="mx-4 h-[45px] w-[1px] bg-dark-border-gray" />
        <div className="flex flex-col justify-center items-center">
          <img
            alt="exchange-logo"
            src={exchangesLogo[account.exchange]}
            width={50}
          />
          <div
            className={cx('font-mono text-xs text-center mt-2', {
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

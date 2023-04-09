import cx from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import useColorChange from 'use-color-change';

import { balanceAtom, loadedAtom } from '../app-state';
import { privacyAtom } from '../atoms/app.atoms';
import { positionsStatsAtom } from '../hooks/use-positions.hooks';
import { pFloat } from '../utils/parse-float.utils';
import { toPercentage } from '../utils/percentage.utils';
import { toUSD } from '../utils/to-usd.utils';

import { GridBlockComponent } from './ui/grid-block.component';
import { LoadingComponent } from './ui/loading.component';

export const AccountSummaryComponent = () => {
  const balance = useAtomValue(balanceAtom);
  const privacy = useAtomValue(privacyAtom);
  const { balance: loaded } = useAtomValue(loadedAtom);

  const { longExposure, shortExposure, totalExposure } = useAtomValue(positionsStatsAtom);

  const equity = balance.total + balance.upnl;
  const leverage = pFloat((totalExposure / equity).toFixed(2)) || 0;

  const longExposureFormatted = privacy
    ? `${((100 * longExposure) / totalExposure || 0).toFixed(2)}%`
    : toUSD(longExposure || 0);

  const shortExposureFormatted = privacy
    ? `${((100 * shortExposure) / totalExposure || 0).toFixed(2)}%`
    : toUSD(shortExposure || 0);

  const availableBalance = privacy
    ? `${((100 * balance.free) / balance.total || 0).toFixed(2)}%`
    : toUSD(balance.free);

  const equityColor = useColorChange(equity, {
    higher: '#45b26b',
    lower: '#ef4444',
    duration: 1500,
  });

  const availableBalanceColor = useColorChange(balance.free, {
    higher: '#45b26b',
    lower: '#ef4444',
    duration: 1500,
  });

  return (
    <>
      <Tooltip anchorId="account" place="bottom" variant="info" className="z-50 font-bold" />
      <GridBlockComponent
        title={
          <div className="flex items-center">
            <div className="font-bold">账户信息</div>
            <div className="ml-auto cursor-help">
              <span
                id="account"
                data-tooltip-content="USDT and BUSD collateral is combined for Binance"
              >
                <FiHelpCircle />
              </span>
            </div>
          </div>
        }
      >
        <div className="no-scrollbar h-full overflow-auto px-2 py-3 text-sm">
          {loaded ? (
            <table className="w-full table-auto">
              <tbody>
                <tr>
                  <td className="text-dark-text-gray font-bold">保证金余额</td>
                  <td className="text-right font-mono font-semibold" style={equityColor}>
                    {privacy ? '******' : toUSD(equity)}
                  </td>
                </tr>
                <tr>
                  <td className="text-dark-text-gray font-bold">可用</td>
                  <td className="text-right font-mono font-semibold" style={availableBalanceColor}>
                    {availableBalance}
                  </td>
                </tr>
                <tr>
                  <td className="text-dark-text-gray font-bold">未实现赢利</td>
                  <td
                    className={cx('text-right font-mono font-semibold', {
                      'text-dark-green': balance.upnl > 0,
                      'text-red-500': balance.upnl < 0,
                    })}
                  >
                    {privacy
                      ? toPercentage({
                          start: balance.total,
                          now: balance.total + balance.upnl,
                        })
                      : toUSD(balance.upnl)}
                  </td>
                </tr>
                <tr>
                  <td className="py-[6px]" />
                </tr>
                <tr>
                  <td className="text-dark-text-gray font-bold">多头资金占用</td>
                  <td className="text-right font-mono font-semibold">{longExposureFormatted}</td>
                </tr>
                <tr>
                  <td className="text-dark-text-gray font-bold">空头资金占用</td>
                  <td className="text-right font-mono font-semibold">{shortExposureFormatted}</td>
                </tr>
                <tr>
                  <td className="text-dark-text-gray font-bold">杠杆</td>
                  <td
                    className={cx('text-right font-mono font-semibold', {
                      'text-dark-green': leverage <= 3,
                      'text-orange-500': leverage > 3 && leverage < 10,
                      'text-red-500': leverage >= 10,
                    })}
                  >
                    x{leverage}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <LoadingComponent />
          )}
        </div>
      </GridBlockComponent>
    </>
  );
};

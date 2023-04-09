import cx from 'clsx';
import { useAtomValue } from 'jotai';
import React from 'react';
import { AiFillStar } from 'react-icons/ai';

import { selectedAtom } from '../../app-state';
import { Exchange, selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import { useFavorites } from '../../hooks/use-favorites.hooks';
import { afterDecimal } from '../../utils/after-decimal.utils';
import { abbreviateNumber } from '../../utils/formatter.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { GridBlockComponent } from '../ui/grid-block.component';
import { LoadingComponent } from '../ui/loading.component';

import { TickerLeverageComponent } from './ticker-leverage.component';

// eslint-disable-next-line complexity
export const TickerInfosComponent = () => {
  const { isFav, toggleFav } = useFavorites();
  const account = useAtomValue(selectedAccountAtom);

  const {
    market,
    ticker,
    positions: [position],
  } = useAtomValue(selectedAtom);

  const decimalsCount = afterDecimal(market?.precision?.price || 2);
  const oi = (ticker?.openInterest ?? 0) * (ticker?.last ?? 0);

  if (!market || !ticker) {
    return (
      <GridBlockComponent title={<div className="font-bold">Ticker infos</div>}>
        <LoadingComponent />
      </GridBlockComponent>
    );
  }

  const displayOi = market && ticker && account?.exchange !== Exchange.Binance;
  const displayLeverage =
    market && position && ticker && account?.exchange !== Exchange.Woo;

  return (
    <GridBlockComponent title={<div className="font-bold">Ticker infos</div>}>
      <div className="px-2 py-3 h-full select-none">
        <div className="flex items-center">
          <div className="text-lg font-bold mr-2">
            {ticker?.symbol.replace(/:.+/, '')}
          </div>
          <span
            className="cursor-pointer"
            onClick={ticker ? () => toggleFav(ticker.symbol) : undefined}
          >
            <AiFillStar
              color={ticker && isFav(ticker.symbol) ? '#EAB308' : '#777E90'}
            />
          </span>
        </div>
        <table className="table-fixed w-full text-sm">
          <tbody>
            {displayOi && (
              <tr>
                <td className="font-semibold">Open Interest</td>
                <td className="text-right font-mono">
                  ${abbreviateNumber(oi)}
                </td>
              </tr>
            )}
            <tr>
              <td className="font-semibold">Funding</td>
              <td
                className={cx('text-right font-mono', {
                  'text-dark-green': (ticker?.fundingRate ?? 0) < 0,
                  'text-red-500': (ticker?.fundingRate ?? 0) > 0,
                })}
              >
                {Math.round((ticker?.fundingRate ?? 0) * 100 * 10e4) / 10e4}%
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Index</td>
              <td className="text-right font-mono">
                ${pFloat(ticker?.index ?? 0).toFixed(decimalsCount)}
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Mark</td>
              <td className="text-right font-mono">
                ${pFloat(ticker?.mark ?? 0).toFixed(decimalsCount)}
              </td>
            </tr>
          </tbody>
        </table>
        {displayLeverage && (
          <TickerLeverageComponent
            key={ticker.symbol} /* used for reset form on symbol change */
            symbol={ticker.symbol}
            positionLeverage={position.leverage}
          />
        )}
      </div>
    </GridBlockComponent>
  );
};

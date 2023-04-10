import cx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { memo } from 'react';
import type { Position } from 'safe-cex/dist/types';
import useColorChange from 'use-color-change';

import { balanceAtom, marketsAtom, tickersAtom } from '../../app-state';
import { privacyAtom } from '../../atoms/app.atoms';
import { selectedSymbolAtom, tradeSizeAtom, tradeSizeUSDAtom } from '../../atoms/trade.atoms';
import { positionsStatsAtom } from '../../hooks/use-positions.hooks';
import { afterDecimal } from '../../utils/after-decimal.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { toPercentage } from '../../utils/percentage.utils';
import { toUSD } from '../../utils/to-usd.utils';
import { getTokenURL } from '../../utils/token-image.utils';
import { PositionsActionsComponent } from '../positions-actions.component';

// eslint-disable-next-line react/display-name
export const PositionRowComponent = memo(({ position }: { position: Position }) => {
  const selectedSymbol = useAtomValue(selectedSymbolAtom);
  const setSize = useSetAtom(tradeSizeAtom);
  const setSizeUSD = useSetAtom(tradeSizeUSDAtom);

  const balance = useAtomValue(balanceAtom);
  const privacy = useAtomValue(privacyAtom);
  const { totalExposure } = useAtomValue(positionsStatsAtom);

  const markets = useAtomValue(marketsAtom);
  const market = markets.find((m) => m.symbol === position.symbol);

  const tickers = useAtomValue(tickersAtom);
  const ticker = tickers.find((t) => t.symbol === position.symbol);

  const price = ticker?.mark || 0;
  const decimalsCount = afterDecimal(market?.precision?.price || 0);

  const equity = balance.total + balance.upnl;
  const lev = Math.round((position.notional / equity) * 100) / 100;
  const pValue = position.contracts * price;
  const liq = position.liquidationPrice.toFixed(decimalsCount);

  const pSymbol = position.symbol.replace(/USDT$|BUSD$/g, '');
  const pEntry = position.entryPrice.toFixed(decimalsCount);

  const collatType = position.symbol.includes('USDT') ? 'USDT' : 'BUSD';

  const pChange = toPercentage({ start: position.entryPrice, now: price });
  const upnlChange = (pFloat(pChange.replace('%', '')) * lev).toFixed(2);

  const sizePct = (100 * pValue) / totalExposure;

  const colorStyle = useColorChange(price, {
    higher: '#45b26b',
    lower: '#ef4444',
    duration: 1500,
  });

  const handleSizeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (position.symbol === selectedSymbol) {
      event.preventDefault();
      setSize(`${Math.abs(position.contracts)}`);
      setSizeUSD('');
    }
  };

  return (
    <>
      <td className="w-[15px]">
        <div
          className={cx('h-[34px] w-1', position.side === 'short' ? 'bg-red-500' : 'bg-dark-green')}
        />
      </td>
      <td>
        <div className="flex cursor-pointer items-center py-[8px]">
          <span className="h-[16px] w-[16px] overflow-hidden rounded-full">
            <img alt={pSymbol} height={16} width={16} src={getTokenURL(position.symbol)} />
          </span>
          <span className="ml-2 text-xs font-bold">{pSymbol}</span>
        </div>
      </td>
      <td className="text-left font-mono text-xs font-semibold">
        <span
          className={cx('rounded-sm border-2 px-1 py-0.5', {
            'text-dark-green border-dark-green': lev <= 3,
            'border-orange-500 text-orange-500': lev > 3 && lev < 10,
            'border-red-500 text-red-500': lev >= 10,
          })}
        >
          x{lev.toFixed(2)}
        </span>
      </td>
      <td className="text-left font-mono text-xs font-semibold">
        <div onClick={handleSizeClick}>
          {privacy ? (
            <>{(sizePct > 100 ? 100 : sizePct).toFixed(2)}%</>
          ) : (
            <div>
              <div>{position.contracts}</div>
              <div className="text-dark-text-gray font-light">{toUSD(pValue)}</div>
            </div>
          )}
        </div>
      </td>
      <td className="text-left font-mono text-xs font-semibold">
        <div>${pEntry}</div>
        <div className="text-dark-text-gray font-light">{privacy ? '*****' : `$${liq}`}</div>
      </td>
      <td className="text-left font-mono text-xs font-semibold">
        <div
          className={cx({
            'text-dark-green': position.unrealizedPnl >= 0,
            'text-red-500': position.unrealizedPnl < 0,
          })}
        >
          {!privacy && (
            <div>
              {position.unrealizedPnl > 0 ? '+' : '-'}
              {toUSD(Math.abs(position.unrealizedPnl).toFixed(2))} {collatType}
            </div>
          )}
          <div className={cx({ 'font-light opacity-70': !privacy })}>
            {position.unrealizedPnl > 0 ? '+' : '-'}
            {upnlChange}%
          </div>
        </div>
      </td>
      <td className="text-left font-mono text-xs font-semibold">
        <div style={colorStyle}>${price.toFixed(decimalsCount)}</div>
        <div className="text-dark-text-gray font-light">
          {price > position.entryPrice ? '+' : '-'}
          {pChange}
        </div>
      </td>
      <td className="text-right">
        <PositionsActionsComponent positions={[position]} />
      </td>
    </>
  );
});

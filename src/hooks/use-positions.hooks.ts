import { atom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { orderBy, sumBy } from 'lodash';
import type { Position } from 'safe-cex/dist/types';
import { PositionSide } from 'safe-cex/dist/types';

import { positionsAtom } from '../app-state';
import { selectedSymbolAtom } from '../atoms/trade.atoms';

type OrderByPositions = keyof Position;
type OrderDirectionPositions = 'asc' | 'desc';

const defaultOrderDirectionAttr: Record<string, OrderDirectionPositions> = {
  symbol: 'asc',
};

export const _orderByPositionsAtom =
  atomWithStorage<`${OrderByPositions}:${OrderDirectionPositions}`>(
    'orderByPositions',
    'notional:desc'
  );

export const orderByPositionsAtom = atom(
  (get) =>
    get(_orderByPositionsAtom).split(':') as [
      OrderByPositions,
      OrderDirectionPositions
    ]
);

export const orderPositionsFnAtom = atom(
  null,
  (get, set, orderByAttr: OrderByPositions) => {
    const [currOrderByAttr, orderDirection] = get(orderByPositionsAtom);

    if (currOrderByAttr === orderByAttr) {
      set(
        _orderByPositionsAtom,
        `${currOrderByAttr}:${orderDirection === 'asc' ? 'desc' : 'asc'}`
      );
    } else {
      const defaultOrder = defaultOrderDirectionAttr[orderByAttr] || 'desc';
      set(_orderByPositionsAtom, `${orderByAttr}:${defaultOrder}`);
    }
  }
);

export const orderedPositionsAtom = atom((get) => {
  const positions = get(positionsAtom).filter((p) => p.contracts !== 0);
  const [orderByAttr, orderDirection] = get(orderByPositionsAtom);

  return orderBy(positions, ['side', orderByAttr], ['asc', orderDirection]);
});

export const usePositions = () => useAtomValue(orderedPositionsAtom);
export const useSymbolPositions = (symbol: string) => {
  const positions = useAtomValue(orderedPositionsAtom);
  return positions.filter((p) => p.symbol === symbol);
};

export const setNextPositionAtom = atom(null, (get, set) => {
  const positions = get(orderedPositionsAtom);
  const selectedSymbol = get(selectedSymbolAtom);

  if (positions.length > 0) {
    const idx = positions.findIndex((p) => p.symbol === selectedSymbol);
    const nextPositionIdx = idx + 1;

    set(
      selectedSymbolAtom,
      nextPositionIdx > positions.length - 1
        ? positions[0].symbol
        : positions[nextPositionIdx].symbol
    );
  }
});

export const setPreviousPositionAtom = atom(null, (get, set) => {
  const positions = get(orderedPositionsAtom);
  const selectedSymbol = get(selectedSymbolAtom);

  if (positions.length > 0) {
    const idx = positions.findIndex((p) => p.symbol === selectedSymbol);
    const nextPositionIdx = idx - 1;

    set(
      selectedSymbolAtom,
      nextPositionIdx < 0
        ? positions[positions.length - 1].symbol
        : positions[nextPositionIdx].symbol
    );
  }
});

export const positionsStatsAtom = atom((get) => {
  const positions = get(positionsAtom);

  const longExposure = sumBy(
    positions.filter((p) => p.side === PositionSide.Long),
    (p) => p.notional + p.unrealizedPnl
  );

  const shortExposure = sumBy(
    positions.filter((p) => p.side === PositionSide.Short),
    (p) => p.notional + p.unrealizedPnl
  );

  const totalExposure = longExposure + shortExposure;

  return {
    longExposure,
    shortExposure,
    totalExposure,
  };
});

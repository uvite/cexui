import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { OrderType, PositionSide } from 'safe-cex/dist/types';

import { selectedAtom } from '../../app-state';
import { tradeEntryTouchedAtom, tradeSizeAtom } from '../../atoms/trade.atoms';

export const selectedSimpleTradeAtom = atomWithStorage('selectedSimpleTrade', OrderType.Limit);

export const simpleTradeEntryAtom = atom('');
export const simpleTradeReduceOnlyAtom = atom(false);

export const simpleOrdersTradeAtom = atom((get) => {
  const { ticker, positions } = get(selectedAtom);

  const type = get(selectedSimpleTradeAtom);
  const size = get(tradeSizeAtom);

  const entry = get(simpleTradeEntryAtom);
  const entryTouched = get(tradeEntryTouchedAtom);
  const entryOrCurrentPrice = entryTouched ? entry : ticker?.last;

  const shortP = positions.find((p) => p.side === PositionSide.Short && p.contracts !== 0);

  const longP = positions.find((p) => p.side === PositionSide.Long && p.contracts !== 0);

  const isTPOrSL = [OrderType.StopLoss, OrderType.TakeProfit].includes(type);
  const disabledBuy = isTPOrSL && !shortP;
  const disabledSell = isTPOrSL && !longP;

  let buySize = size;
  let sellSize = size;
  if (isTPOrSL) {
    sellSize = longP?.contracts?.toString() || '';
    buySize = shortP?.contracts?.toString() || '';
  }

  return {
    price: entryOrCurrentPrice,
    type,
    size,
    buySize,
    sellSize,
    disabledBuy,
    disabledSell,
    isTPOrSL,
  };
});

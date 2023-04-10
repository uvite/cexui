import { atom, useAtomValue } from 'jotai';
import { OrderSide } from 'safe-cex/dist/types';

import { selectedAtom, tickersAtom } from '../app-state';
import { tradeBuyIntoAtom, tradeSellIntoAtom, tradeSideAtom } from '../atoms/trade.atoms';

export enum PriceType {
  Ask = 'ask',
  Bid = 'bid',
  Last = 'last',
}

export const selectedSymbolSidePriceAtom = atom((get) => {
  const sellInto = get(tradeSellIntoAtom);
  const buyInto = get(tradeBuyIntoAtom);

  const { ticker } = get(selectedAtom);
  const side = get(tradeSideAtom);

  const priceType = side === OrderSide.Buy ? buyInto : sellInto;
  return ticker?.[priceType] || ticker?.last || 0;
});

export const useGetTickerPrice = () => {
  const tickers = useAtomValue(tickersAtom);
  const sellInto = useAtomValue(tradeSellIntoAtom);
  const buyInto = useAtomValue(tradeBuyIntoAtom);

  return (symbol: string, side: OrderSide) => {
    const ticker = tickers.find((t) => t.symbol === symbol);
    const priceType = side === OrderSide.Buy ? buyInto : sellInto;
    return ticker?.[priceType] || ticker?.last || 0;
  };
};

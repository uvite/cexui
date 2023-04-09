import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';

import { appSettingsAtom } from '../app-settings';
import { selectedSymbolSidePriceAtom } from '../hooks/use-ticker-price.hooks';
import { pFloat } from '../utils/parse-float.utils';

// Not synced to backend
// ---------------------
export enum LastTouchedInput {
  Entry = 'entry',
  From = 'from',
  StopLoss = 'stopLoss',
  TakeProfit = 'takeProfit',
  To = 'to',
}

export const tradeLastTouchedAtom = atom<LastTouchedInput | null>(null);
export const tradeEntryTouchedAtom = atom(false);

export const tradeSizeAtom = atom('');
export const tradeSizeUSDAtom = atom('');

export const tradeFromAtom = atom('');
export const tradeToAtom = atom('');
export const tradeStopLossAtom = atom('');
export const tradeTakeProfitAtom = atom('');
export const tradeReduceOnlyAtom = atom(false);

// Computed from preferences and state
// -----------------------------------
export const tradeEntryOrCurrentPriceAtom = atom((get) => {
  const entry = get(tradeFromAtom);
  const entryTouched = get(tradeEntryTouchedAtom);
  const symbolPrice = get(selectedSymbolSidePriceAtom);

  return entryTouched ? entry : symbolPrice;
});

// Saved preferences
// -----------------
export const selectedSymbolAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('selectedSymbol')
);

export const tradeSideAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('side')
);

export const nbOrdersAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('scaledOrdersCount')
);

export const selectedTradeAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('selectedComponent')
);

export const maxRiskAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('maxRisk')
);

export const maxMarketSlippageAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('maxMarketSlippage')
);

export const riskAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('scaleByRisk').prop('risk')
);

export const quantityScaledAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('scaleByRisk').prop('quantityScaled')
);

export const priceScaleRatioAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('priceScaleRatio')
);

export const twapLengthAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('twap').prop('length')
);

export const twapLotsCountAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('twap').prop('lotsCount')
);

export const tradeBuyIntoAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('buyInto')
);

export const tradeSellIntoAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('sellInto')
);

export const twapRandomnessAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('twap').prop('randomness')
);

export const chasePercentLimitAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('chase').prop('percentLimit')
);

export const _chaseInfiniteAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('chase').prop('infinite')
);

export const _chaseStalkAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('chase').prop('stalk')
);

export const chaseInfiniteAtom = atom(
  (get) => get(_chaseInfiniteAtom),
  (get, set, value: boolean) => {
    set(_chaseInfiniteAtom, value);
    if (get(_chaseStalkAtom) && value) set(_chaseStalkAtom, false);
  }
);

export const chaseStalkAtom = atom(
  (get) => get(_chaseStalkAtom),
  (get, set, value: boolean) => {
    set(_chaseStalkAtom, value);
    if (get(_chaseInfiniteAtom) && value) set(_chaseInfiniteAtom, false);
  }
);

export const fatFingerProtectionAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('trading').prop('fatFingerProtection')
);

export const fatFingerValueAtom = atom((get) => {
  const value = get(fatFingerProtectionAtom);
  const asNumber = pFloat(value);

  if (!Number.isNaN(asNumber) && asNumber > 0) {
    return asNumber;
  }

  return 0;
});

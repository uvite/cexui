import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export enum Exchange {
  Bybit = 'bybit',
  Binance = 'binance',
  Woo = 'woo',
}

export const exchangesLogo = {
  [Exchange.Bybit]: '/bybit.png',
  [Exchange.Binance]: '/binance.png',
  [Exchange.Woo]: '/woo.svg',
};

export const exchangesRef = {
  [Exchange.Bybit]: {
    link: 'https://partner.bybit.com/b/tuleep',
    label: '$30,000 deposit bonus',
    help: 'https://docs.tuleep.trade/getting-started/create-exchange-api-key/bybit',
  },
  [Exchange.Woo]: {
    link: 'https://x.woo.org/register?ref=TULEEP',
    label: '0 fees for 14 days',
    help: 'https://docs.tuleep.trade/getting-started/create-exchange-api-key/woo',
  },
  [Exchange.Binance]: {
    link: 'https://accounts.binance.com/en/register?ref=KOLLSXK0',
    label: '$100 deposit bonus',
    help: 'https://docs.tuleep.trade/getting-started/create-exchange-api-key/binance',
  },
};

export const exchanges = [Exchange.Bybit, Exchange.Woo, Exchange.Binance];
export const exchangesLabel = {
  [Exchange.Bybit]: 'Bybit',
  [Exchange.Binance]: 'Binance',
  [Exchange.Woo]: 'Woo X',
};

export interface Account {
  exchange: Exchange;
  key: string;
  secret: string;
  name: string;
  testnet: boolean;
  selected: boolean;
  applicationId?: string;
}

export const accountsAtom = atomWithStorage<Account[]>('accounts', []);

export const addAccountAtom = atom(null, (get, set, account: Account) => {
  const prev = get(accountsAtom).map((p) => ({ ...p, selected: false }));
  const merged = [...prev, { ...account, selected: true }];
  set(accountsAtom, merged);
});

export const removeAccountAtom = atom(null, (get, set, accountName: string) => {
  const prev = get(accountsAtom);
  const without = prev.filter((p) => p.name !== accountName);
  set(accountsAtom, without);
});

export const selectedAccountAtom = atom(
  (get) => {
    const accounts = get(accountsAtom);
    return accounts.find((acc) => acc.selected) || accounts[0] || undefined;
  },
  (get, set, accountName: string) => {
    const accounts = get(accountsAtom);
    const account = accounts.find((acc) => acc.name === accountName);

    if (account) {
      set(
        accountsAtom,
        accounts.map((acc) => ({ ...acc, selected: acc.name === accountName }))
      );
    }
  }
);

import { useJitsu } from '@jitsu/nextjs';
import { useAtomValue, useSetAtom } from 'jotai';

import { crypt } from '../utils/crypt';

import { selectedAccountAtom } from './use-accounts.hooks';
import { logsAtom } from './use-logs.hooks';

export enum EventName {
  Trade = 'trade',
  SignIn = 'sign_in',
  SignOut = 'sign_out',
  AddExchangeAccount = 'add_exchange_account',
  RemoveExchangeAccount = 'remove_exchange_account',
  SwitchAccount = 'switch_account',
  Nuke = 'nuke',
  CancelOrder = 'cancel_order',
  CancelAllOrders = 'cancel_all_orders',
  CancelSymbolOrders = 'cancel_symbol_orders',
  UpdateLeverage = 'update_leverage',
  UpdateAllLeverage = 'update_all_leverage',
  AddExchangeAccountError = 'add_exchange_account_error',
}

type SignInEvent = { label: string };
type AddExchangeAccountEvent = { exchange: string; testnet: boolean };
type CancelSymbolOrdersEvent = { symbol: string };
type UpdateLeverageEvent = { symbol: string; leverage: number };
type UpdateAllLeverageEvent = { leverage: number };

type CancelOrderEvent = {
  symbol: string;
  side: string;
  price: number;
  amount: number;
};

type TradeEvent = {
  from: string;
  testnet?: boolean;
  order: {
    symbol: string;
    side: string;
    amount: number;
    price: number;
    takeProfit?: number;
    stopLoss?: number;
    reduceOnly?: boolean;
  };
};

type AddExchangeAccountErrorEvent = {
  exchange: string;
  testnet: boolean;
  error: string;
};

type Track = {
  (evt: EventName.SignIn, props: SignInEvent): void;
  (evt: EventName.AddExchangeAccount, props: AddExchangeAccountEvent): void;
  (evt: EventName.Trade, props: TradeEvent): void;
  (evt: EventName.CancelSymbolOrders, props: CancelSymbolOrdersEvent): void;
  (evt: EventName.CancelOrder, props: CancelOrderEvent): void;
  (evt: EventName.UpdateLeverage, props: UpdateLeverageEvent): void;
  (evt: EventName.UpdateAllLeverage, props: UpdateAllLeverageEvent): void;
  (evt: EventName.AddExchangeAccountError, props: AddExchangeAccountErrorEvent): void;
  (
    evt:
      | EventName.CancelAllOrders
      | EventName.Nuke
      | EventName.RemoveExchangeAccount
      | EventName.SignOut
      | EventName.SwitchAccount,
    props: undefined,
  ): void;
};

export const useAnalytics = () => {
  const { track } = useJitsu();

  const log = useSetAtom(logsAtom);
  const account = useAtomValue(selectedAccountAtom);

  const t: Track = (...args) => {
    const [eventName, eventProps] = args;

    // add stage to the event props
    const eventPropsWithStage: Record<string, any> = {
      ...eventProps,
      stage: process.env.STAGE,
    };

    if (eventName === EventName.Trade) {
      // assign testnet to the trade event
      // we want to filter those from orders volume and trades count
      // as they are really less significant that the real ones
      eventPropsWithStage.testnet = account?.testnet;
      eventPropsWithStage.order = crypt(JSON.stringify(eventPropsWithStage.order));
    }

    if (process.env.STAGE !== 'dev') {
      // we run the track in the next tick
      // to avoid blocking the user interaction
      setTimeout(() => track(eventName, eventPropsWithStage), 0);
    }

    // we want to log the events in dev mode
    // directly in the terminal console logs
    if (process.env.STAGE === 'dev') {
      log(
        `[ANALYTICS] ${JSON.stringify({
          eventName,
          eventProps: eventPropsWithStage,
        })}`,
      );
    }
  };

  return t;
};

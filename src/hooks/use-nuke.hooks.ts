import { useSetAtom } from 'jotai';
import { useContext } from 'react';

import { useChaseTrade } from './trade/use-chase.hooks';
import { useTwapTrade } from './trade/use-twap.hooks';
import { EventName, useAnalytics } from './use-analytics.hooks';
import { ConnectorContext } from './use-exchange-connector.hooks';
import { logsAtom } from './use-logs.hooks';

export const useNuke = () => {
  const log = useSetAtom(logsAtom);
  const track = useAnalytics();
  const exchange = useContext(ConnectorContext);

  const { stopAll } = useTwapTrade();
  const { chases } = useChaseTrade();

  const nuke = () => {
    stopAll();
    chases.forEach(({ chase }) => chase.stop());
    exchange?.nuke();
    track(EventName.Nuke, undefined);
    log(`[USER] Nuke account`);
  };

  return nuke;
};

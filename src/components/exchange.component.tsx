import React from 'react';

import {
  useExchangeConnector,
  ConnectorContext,
} from '../hooks/use-exchange-connector.hooks';

export const ExchangeComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const connector = useExchangeConnector();

  return (
    <ConnectorContext.Provider value={connector}>
      {children}
    </ConnectorContext.Provider>
  );
};

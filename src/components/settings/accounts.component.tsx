import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { FiDelete } from 'react-icons/fi';

import { accountsAtom, exchangesLogo, removeAccountAtom } from '../../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { ButtonComponent } from '../ui/button.component';

import { AddAccountComponent } from './add-account.component';

export const AccountsComponent = () => {
  const track = useAnalytics();

  const accounts = useAtomValue(accountsAtom);
  const removeAccount = useSetAtom(removeAccountAtom);

  const rm = (account: string) => {
    removeAccount(account);
    track(EventName.RemoveExchangeAccount, undefined);
  };

  const [showAddAccount, setShowAddAccount] = useState(accounts.length === 0);

  if (showAddAccount) {
    return <AddAccountComponent onBack={() => setShowAddAccount(false)} />;
  }

  return (
    <div className="min-h-[300px] px-2 py-3">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-dark-text-gray font-mono text-sm">
            <th className="pb-4 text-left">Exchange</th>
            <th className="pb-4 text-left">Name</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.name} className="hover:bg-dark-bg-2 font-mono text-sm font-semibold">
              <td className="py-[10px]">
                <img src={exchangesLogo[acc.exchange]} alt={acc.exchange} width={40} />
              </td>
              <td>{acc.name}</td>
              <td>
                {acc.testnet && (
                  <span className="text-dark-text-gray border-dark-border-gray rounded-sm border px-1 py-0.5 text-xs font-semibold">
                    testnet
                  </span>
                )}
              </td>
              <td className="cursor-pointer text-xl text-red-500 opacity-70 transition-opacity hover:opacity-100">
                <FiDelete onClick={() => rm(acc.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6">
        <ButtonComponent size="small" className="w-full" onClick={() => setShowAddAccount(true)}>
          Add account
        </ButtonComponent>
      </div>
    </div>
  );
};

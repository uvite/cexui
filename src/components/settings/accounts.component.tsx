import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { FiDelete } from 'react-icons/fi';

import {
  accountsAtom,
  exchangesLogo,
  removeAccountAtom,
} from '../../hooks/use-accounts.hooks';
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
    <div className="px-2 py-3 min-h-[300px]">
      <table className="table-auto w-full">
        <thead>
          <tr className="font-mono text-sm text-dark-text-gray">
            <th className="text-left pb-4">Exchange</th>
            <th className="text-left pb-4">Name</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr
              key={acc.name}
              className="font-mono text-sm font-semibold hover:bg-dark-bg-2"
            >
              <td className="py-[10px]">
                <img
                  src={exchangesLogo[acc.exchange]}
                  alt={acc.exchange}
                  width={40}
                />
              </td>
              <td>{acc.name}</td>
              <td>
                {acc.testnet && (
                  <span className="text-dark-text-gray text-xs font-semibold border border-dark-border-gray px-1 py-0.5 rounded-sm">
                    testnet
                  </span>
                )}
              </td>
              <td className="text-xl text-red-500 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <FiDelete onClick={() => rm(acc.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6">
        <ButtonComponent
          size="small"
          className="w-full"
          onClick={() => setShowAddAccount(true)}
        >
          Add account
        </ButtonComponent>
      </div>
    </div>
  );
};

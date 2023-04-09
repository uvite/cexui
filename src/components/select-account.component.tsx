import { useAtom, useAtomValue } from 'jotai';
import { useSession } from 'next-auth/react';
import React from 'react';
import type { SingleValue } from 'react-select';
import Select from 'react-select';

import { selectedAccountAtom, accountsAtom } from '../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../hooks/use-analytics.hooks';

export const SelectAccountComponent = () => {
  const track = useAnalytics();
  const { data: session } = useSession();

  const accounts = useAtomValue(accountsAtom);
  const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

  const value =
    session && selectedAccount
      ? { value: selectedAccount.name, label: selectedAccount.name }
      : undefined;

  const handleChange = (
    event: SingleValue<{ value: string; label: string }>
  ) => {
    if (event) {
      track(EventName.SwitchAccount, undefined);
      setSelectedAccount(event.value);
    }
  };

  return (
    <Select
      id="select-account"
      instanceId="select-account"
      className="react-select-container flex-1 w-[180px] z-50"
      classNamePrefix="react-select"
      name="select-account"
      isClearable={false}
      blurInputOnSelect={true}
      isSearchable={false}
      value={value}
      options={
        session
          ? accounts.map((acc) => ({ value: acc.name, label: acc.name }))
          : []
      }
      onChange={handleChange}
    />
  );
};

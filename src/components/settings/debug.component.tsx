import download from 'downloadjs';
import { useAtomValue } from 'jotai';
import { omit } from 'lodash';
import React from 'react';

import { appStateAtom } from '../../app-state';
import { logsAtom } from '../../hooks/use-logs.hooks';
import { ButtonComponent } from '../ui/button.component';

export const DebugComponent = () => {
  const logs = useAtomValue(logsAtom);
  const appState = useAtomValue(appStateAtom);

  const onClick = () => {
    const debug = { logs, state: omit(appState, ['balance', 'latency']) };
    download(JSON.stringify(debug), 'debug.json', 'application/json');
  };

  return (
    <div className="mb-4 min-h-[300px] px-6 py-4">
      <div className="text-lg font-bold">Debug informations</div>
      <p className="text-dark-text-gray py-4 text-sm">
        Only share these debug informations to @iam4x if asked to do so.
      </p>
      <ButtonComponent onClick={onClick}>Download `debug.json`</ButtonComponent>
    </div>
  );
};

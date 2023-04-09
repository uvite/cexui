import { useAtomValue } from 'jotai';
import { capitalize } from 'lodash';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import React from 'react';
import Modal from 'react-modal';
import useScrollLock from 'use-scroll-lock';

import { selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { useIsModalOpen } from '../../hooks/use-modal.hooks';
import { ButtonComponent } from '../ui/button.component';

import { AccountsComponent } from './accounts.component';
import { DebugComponent } from './debug.component';
import { GeneralSettingsComponent } from './general.component';
import { HedgeModeSettingsComponent } from './hedge-mode.component';
import { LeverageSettingsComponent } from './leverage.component';
import { NewsSettingsComponent } from './news-settings/news-settings.component';
import { ShortcutsComponent } from './shortcuts.component';

const modalStyles: Modal['props']['style'] = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 0,
    padding: 0,
    background: 'transparent',
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 999,
  },
};

const tabs = [
  'general',
  'accounts',
  'shortcuts',
  'news-trading',
  'leverage',
  'hedge-mode',
  'debug',
];

export const SettingsModalComponent = () => {
  const track = useAnalytics();

  const router = useRouter();
  const isOpen = useIsModalOpen();

  useScrollLock(isOpen);

  const account = useAtomValue(selectedAccountAtom);

  const onRequestClose = () => {
    const [path] = router.asPath.split('?');
    return router.push(path, path, { shallow: true });
  };

  const activeTab = !account ? 'accounts' : (router.query.tab as string);
  const displayedTabs = !account ? ['accounts'] : tabs;

  const setActiveTab = (tab: string) => {
    const [path] = router.asPath.split('?');
    const nextURL = `${path}?modal=settings&tab=${tab}`;
    return router.push(nextURL, nextURL, { shallow: true });
  };

  const handleSignOut = () => {
    track(EventName.SignOut, undefined);
    onRequestClose().then(() => signOut());
  };

  return (
    <Modal
      isOpen={isOpen}
      style={modalStyles}
      shouldCloseOnOverlayClick={false}
      onRequestClose={account ? onRequestClose : () => {}}
    >
      <div className="w-[80vw] max-w-[800px] bg-dark-bg">
        <div className="border-2 border-dark-bg">
          <div className="bg-dark-bg-2 border-b border-b-sky-300 py-2 px-3">
            <span className="font-bold font-mono text-sm">Settings</span>
            <span className="mx-2">-</span>
            <span className="font-bold text-sm text-dark-text-gray">
              {capitalize(activeTab)}
            </span>
          </div>
          <div className="flex">
            <div className="relative min-w-[150px] border-r border-r-dark-bg-2 px-2 py-3">
              {displayedTabs.map((tab) => (
                <div key={tab} className="mb-2 last:mb-0">
                  <ButtonComponent
                    size="small"
                    selected={tab === activeTab}
                    className="w-full"
                    onClick={() => setActiveTab(tab)}
                  >
                    {capitalize(tab.split('-').join(' '))}
                  </ButtonComponent>
                </div>
              ))}
              <div className="absolute bottom-2 w-full pr-4">
                <ButtonComponent
                  size="small"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Logout
                </ButtonComponent>
              </div>
            </div>
            <div className="flex-1 min-h-[400px] max-h-[calc(100vh/1.5)] overflow-y-auto">
              {activeTab === 'general' && <GeneralSettingsComponent />}
              {activeTab === 'accounts' && <AccountsComponent />}
              {activeTab === 'shortcuts' && <ShortcutsComponent />}
              {activeTab === 'news-trading' && <NewsSettingsComponent />}
              {activeTab === 'leverage' && <LeverageSettingsComponent />}
              {activeTab === 'hedge-mode' && <HedgeModeSettingsComponent />}
              {activeTab === 'debug' && <DebugComponent />}
            </div>
          </div>
          <div className="bg-dark-bg-2 border-t border-t-sky-300 py-2 px-3 text-right h-[45px]">
            {account && (
              <ButtonComponent
                size="xsmall"
                className="bg-dark-bg"
                onClick={onRequestClose}
              >
                Close
              </ButtonComponent>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

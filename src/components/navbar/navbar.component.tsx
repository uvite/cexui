import { useAtomValue, useSetAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import React from 'react';
import { AiFillSetting } from 'react-icons/ai';
import { FiHelpCircle } from 'react-icons/fi';

import { TradeComponentType } from '../../app.types';
import { selectedTradeAtom } from '../../atoms/trade.atoms';
import { useIsChasing } from '../../hooks/trade/use-chase.hooks';
import { twapsAtom } from '../../hooks/trade/use-twap.hooks';
import { useOpenModal } from '../../hooks/use-modal.hooks';
import { useNewVersion } from '../../hooks/use-new-version.hooks';
import { SelectAccountComponent } from '../select-account.component';

import { NavbarActionsComponent } from './navbar-actions.component';
import { NavbarClockComponent } from './navbar-clock.component';
import { NavbarIndicator } from './navbar-indicator.component';
import { NavbarLatencyComponent } from './navbar-latency.component';

export const NavbarComponent = () => {
  const { data: session } = useSession();

  const openSettingsModal = useOpenModal();

  const hasNewVersion = useNewVersion();

  const isChasing = useIsChasing();
  const twapRunning = useAtomValue(twapsAtom).length > 0;

  const setSelectedTrade = useSetAtom(selectedTradeAtom);

  return (
    <>
      {/*{process.env.STAGE !== 'prod' && (*/}
      {/*  <div className="bg-purple-500 text-white text-center py-0.5">*/}
      {/*    <span className="font-bold">WARNING:</span> This is a preview version*/}
      {/*    of the app.*/}
      {/*  </div>*/}
      {/*)}*/}
      {process.env.STAGE !== 'dev' && hasNewVersion && (
        <div
          className="cursor-pointer border-b-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 py-2 text-center text-white"
          onClick={() => (window as any).location.reload(true)}
        >
          A new version of <strong>tuleep.trade</strong> is available, click here to reload your
          page.
        </div>
      )}
      <div className="border-dark-border-gray bg-dark-bg text-dark-text-white border-b ">
        <div className="px-4 py-3 md:py-2">
          <div className="flex items-center">
            <h1 className="text-dark-text-white text-2xl font-bold tracking-widest">
              <img src="/assets/images/logo.svg" alt="gvm" className="mr-2 inline w-[30px]" />
              <span>Gvm bot</span>
            </h1>
            {session && (
              <>
                <NavbarLatencyComponent />
                <NavbarActionsComponent />
              </>
            )}
            <div className="ml-auto flex items-center">
              {session && (
                <>
                  <div className="ml-auto">
                    <div className="flex items-center">
                      <div
                        className="text-dark-text-gray hover:text-dark-text-white mr-4 cursor-pointer text-2xl transition-colors"
                        onClick={() => openSettingsModal()}
                      >
                        <AiFillSetting />
                      </div>
                      <SelectAccountComponent />
                    </div>
                  </div>
                  {twapRunning && (
                    <NavbarIndicator
                      label="TWAP"
                      onClick={() => setSelectedTrade(TradeComponentType.Twap)}
                    />
                  )}
                  {isChasing && (
                    <NavbarIndicator
                      label="CHASE"
                      onClick={() => setSelectedTrade(TradeComponentType.Chase)}
                    />
                  )}
                  <NavbarClockComponent />
                </>
              )}
              <a
                className="text-dark-text-gray hover:text-dark-text-white ml-2 cursor-pointer text-3xl transition-colors"
                href="https://docs.tuleep.trade"
                target="_blank"
                rel="noreferrer"
              >
                <FiHelpCircle />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

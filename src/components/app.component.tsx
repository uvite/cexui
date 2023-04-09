import { useSession } from 'next-auth/react';
import React from 'react';

import { useIdentifyAnalytics } from '../hooks/use-identify-analytics.hooks';
import { usePushNotifications } from '../hooks/use-push-notifications.hooks';

import { ExchangeComponent } from './exchange.component';
import { GridWrapperComponent } from './grid-wrapper.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SettingsModalComponent } from './settings/settings-modal.component';

export const AppComponent = () => {
  useIdentifyAnalytics();
  usePushNotifications();

  const { data: session } = useSession();

  if (session) {
    return (
      <ExchangeComponent>
        <SettingsModalComponent />
        <NavbarComponent />
        <GridWrapperComponent />
      </ExchangeComponent>
    );
  }

  return <HomeComponent />;
};

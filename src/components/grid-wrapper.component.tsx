import React from 'react';

import { useSettingsSync } from '../hooks/use-settings-sync.hooks';

import { GridComponent } from './grid.component';

export const GridWrapperComponent = () => {
  const { loaded, settings } = useSettingsSync();

  if (loaded) {
    return <GridComponent layouts={settings.layouts} />;
  }

  return <div />;
};

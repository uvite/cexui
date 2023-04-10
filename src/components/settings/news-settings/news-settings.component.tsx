import React from 'react';

import { NewsSettingsBlockListComponent } from './news-settings.block-list.component';
import { NewsSettingsCheckboxesComponent } from './news-settings.checkboxes.component';
import { NewsSettingsCustomWordsComponent } from './news-settings.custom-words.component';
import { NewsSettingsDefaultSizeComponent } from './news-settings.default-size.component';
import { NewsSettingsDefaultTickersComponent } from './news-settings.default-tickers.component';
import { NewsSettingsOrderTypeComponent } from './news-settings.order-type.component';
import { NewsSettingsPlaybackSpeedComponent } from './news-settings.playback-speed.component';
import { NewsSettingsTreenewsApiComponent } from './news-settings.treenews-api.component';

export const NewsSettingsComponent = () => {
  return (
    <div className="mb-4 min-h-[300px] px-6 py-4">
      <NewsSettingsDefaultTickersComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsCustomWordsComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsBlockListComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsOrderTypeComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsDefaultSizeComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsTreenewsApiComponent />
      <div className="bg-dark-bg-2 my-4 h-[1px] w-full" />
      <NewsSettingsCheckboxesComponent />
      <NewsSettingsPlaybackSpeedComponent />
    </div>
  );
};

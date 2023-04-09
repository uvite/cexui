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
    <div className="px-6 py-4 mb-4 min-h-[300px]">
      <NewsSettingsDefaultTickersComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsCustomWordsComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsBlockListComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsOrderTypeComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsDefaultSizeComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsTreenewsApiComponent />
      <div className="w-full my-4 h-[1px] bg-dark-bg-2" />
      <NewsSettingsCheckboxesComponent />
      <NewsSettingsPlaybackSpeedComponent />
    </div>
  );
};

import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import Select from 'react-select';

import { marketsAtom } from '../../../app-state';
import { newsDefaultTickersAtom } from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsDefaultTickersComponent = () => {
  const tickers = useAtomValue(marketsAtom).map((m) => m.symbol);
  const [defaultTickers, setDefaultTickers] = useAtom(newsDefaultTickersAtom);

  return (
    <>
      <div className="font-bold text-lg">Default tickers</div>
      <p className="text-dark-text-gray text-sm py-2">
        If not tickers match the news, those will be used.
        <br />
        For readibilty reasons, only 3 tickers can be picked.
      </p>
      <Select
        id="news-default-tickers"
        instanceId="news-default-tickers"
        className="react-select-container w-full z-[100]"
        classNamePrefix="react-select"
        value={defaultTickers.map((t) => ({ value: t, label: t }))}
        options={tickers.map((t) => ({ value: t, label: t }))}
        isMulti={true}
        closeMenuOnSelect={false}
        isOptionDisabled={() => defaultTickers.length >= 3}
        onChange={(data) => setDefaultTickers(data.map((d) => d.value))}
      />
    </>
  );
};

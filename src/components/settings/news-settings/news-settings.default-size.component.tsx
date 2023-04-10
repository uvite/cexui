import { useAtom } from 'jotai';
import React from 'react';

import { newsDefaultTradeSizeAtom } from '../../../hooks/trade/use-news-trade.hooks';
import { pFloat } from '../../../utils/parse-float.utils';

export const NewsSettingsDefaultSizeComponent = () => {
  const [defaultSize, setDefaultSize] = useAtom(newsDefaultTradeSizeAtom);

  return (
    <>
      <div className="text-lg font-bold">Default size</div>
      <p className="text-dark-text-gray py-2 text-sm">
        Default size in USD to be pre-filled in the BUY/SELL input.
        <br />
        When you update the size from news feed directly, it will be saved per tokens.
      </p>
      <input
        type="text"
        className="mr-1 w-1/4 text-center font-mono"
        value={`${defaultSize}`}
        onChange={(e) => {
          if (!isNaN(pFloat(e.target.value))) {
            setDefaultSize(pFloat(e.target.value));
          }
        }}
      />
    </>
  );
};

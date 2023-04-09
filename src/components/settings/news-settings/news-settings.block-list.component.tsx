import { useAtom } from 'jotai';
import React from 'react';
import Tags from 'react-tagsinput';

import { newsBlocklistAtom } from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsBlockListComponent = () => {
  const [blocklist, setBlocklist] = useAtom(newsBlocklistAtom);

  return (
    <>
      <div className="font-bold text-lg">Words block list</div>
      <p className="text-dark-text-gray text-sm py-2">
        News containing those words will be ignored.
        <br />
        Ex: If you want to remove Elon Musk tweets from the news feed.
      </p>
      <div>
        <Tags
          className="tags-input"
          value={blocklist}
          onChange={(words) => setBlocklist(words)}
        />
      </div>
    </>
  );
};

import { useAtom } from 'jotai';
import React from 'react';
import Tags from 'react-tagsinput';

import { newsBlocklistAtom } from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsBlockListComponent = () => {
  const [blocklist, setBlocklist] = useAtom(newsBlocklistAtom);

  return (
    <>
      <div className="text-lg font-bold">Words block list</div>
      <p className="text-dark-text-gray py-2 text-sm">
        News containing those words will be ignored.
        <br />
        Ex: If you want to remove Elon Musk tweets from the news feed.
      </p>
      <div>
        <Tags className="tags-input" value={blocklist} onChange={(words) => setBlocklist(words)} />
      </div>
    </>
  );
};

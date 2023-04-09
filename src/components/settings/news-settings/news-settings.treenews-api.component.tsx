import { useAtom } from 'jotai';
import React from 'react';

import { treeNewsKeyAtom } from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsTreenewsApiComponent = () => {
  const [key, setKey] = useAtom(treeNewsKeyAtom);

  return (
    <>
      <div className="font-bold text-lg">TreeNews API Key</div>
      <p className="text-dark-text-gray text-sm py-2">
        This is for paid subscribers of TreeNews.
        <br />
        Get your API key here:{' '}
        <a
          href="https://news.treeofalpha.com/api/api_key"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          https://news.treeofalpha.com/api/api_key
        </a>
      </p>
      <input
        type="text"
        value={key}
        className="w-full font-mono text-xs placeholder:opacity-30"
        placeholder="618c3d66660adff7f752856af08ee2cf6399c3d04ba3f837bee4417b08811f4e"
        onChange={(e) => setKey(e.currentTarget.value)}
      />
    </>
  );
};

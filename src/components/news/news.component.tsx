import cx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Mousetrap from 'mousetrap';
import React, { useEffect, useRef, useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { FaLock } from 'react-icons/fa';
import { TiDelete } from 'react-icons/ti';
import { Tooltip } from 'react-tooltip';
import type { VirtuosoHandle } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';
import { OrderSide } from 'safe-cex/dist/types';

import { marketsAtom } from '../../app-state';
import { messageHistoryAtom, newsSearchAtom } from '../../atoms/app.atoms';
import {
  newsDisabledSourcesAtom,
  selectedNewsAtom,
  selectFirstNewsAtom,
  selectNextNewsAtom,
  selectPreviousNewsAtom,
} from '../../hooks/trade/use-news-trade.hooks';
import { selectedAccountAtom } from '../../hooks/use-accounts.hooks';
import { useApeNews } from '../../hooks/use-ape-news.hooks';
import { joinKeys } from '../../hooks/use-keybindings.hooks';
import { fakeData } from '../../hooks/use-news/fake.data';
import { useNews } from '../../hooks/use-news/use-news.hooks';
import { NewsSources } from '../../hooks/use-news/use-news.types';
import { shortcutsAtom } from '../../hooks/use-shortcuts.hooks';
import { formatNews } from '../../utils/format-news.utils';
import { SubscribeModalComponent } from '../subscribe/subscribe-modal.component';
import { ButtonComponent } from '../ui/button.component';
import { GridBlockComponent } from '../ui/grid-block.component';
import { LoadingComponent } from '../ui/loading.component';

import { ArticleComponent } from './article.component';
import { NewsmakerComponent } from './sources/newsmaker.component';
import { TreeNewsComponent } from './sources/treenews.component';

const UnlockedNewsComponent = () => {
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [loaded, setLoaded] = useState(false);

  const { messages } = useNews();

  const [selected, setSelected] = useAtom(selectedNewsAtom);
  const [search, setSearch] = useAtom(newsSearchAtom);
  const setNewsHistory = useSetAtom(messageHistoryAtom);

  const clear = () => {
    setNewsHistory([]);
    setSelected(null);
  };

  const handleKeyDown = ({
    key,
    currentTarget,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Escape') {
      setSearch('');
      currentTarget.blur();
    }
  };

  useEffect(() => {
    const idx = messages.findIndex((m) => m.id === selected);
    if (idx !== -1 && virtuoso.current) {
      virtuoso.current.scrollIntoView({
        index: idx,
        align: 'start',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (messages.length > 0 && !loaded) {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  if (!loaded && messages.length === 0) {
    return <LoadingComponent />;
  }

  if (loaded && !search.trim() && messages.length === 0) {
    return (
      <div className="w-full text-center animate-pulse mt-8 font-bold text-lg">
        Waiting for news...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="p-1 relative">
        <input
          id="news-search"
          type="text"
          placeholder="Search..."
          className="w-full bg-dark-bg"
          value={search}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <span
          className={cx(
            'absolute cursor-pointer right-2 top-3 opacity-70 hover:opacity-100 transition-opacity',
            { hidden: !search }
          )}
        >
          <TiDelete className="text-lg" onClick={() => setSearch('')} />
        </span>
      </div>
      {messages.length > 0 && (
        <button
          type="button"
          className="absolute bottom-3 left-3 z-50 bg-dark-bg w-8 h-8 flex items-center justify-center rounded-full group cursor-pointer shadow-md shadow-dark-bg/70"
          onClick={() => clear()}
        >
          <BiTrash className="text-dark-border-gray-2 group-hover:text-dark-text-white transition-colors" />
        </button>
      )}
      <div className="h-[calc(100%-44px)]">
        <Virtuoso
          ref={virtuoso}
          data={messages}
          totalCount={messages.length}
          className="no-scrollbar"
          itemContent={(_index, item) => (
            <ArticleComponent
              id={item.id}
              author={item.news.author}
              content={item.news.content}
              link={item.news.link}
              source={item.news.source}
              time={item.news.time}
              symbols={item.symbols}
              receivedAt={item.receivedAt}
              selected={selected ? selected === item.id : undefined}
            />
          )}
        />
      </div>
    </div>
  );
};

const LockedNewsComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onRequestClose = () => setIsOpen(false);

  const formatted = fakeData.map(({ news, symbols }) => ({
    news: formatNews(news as any),
    symbols,
  }));

  return (
    <>
      <SubscribeModalComponent
        isOpen={isOpen}
        onRequestClose={onRequestClose}
      />
      <div className="h-full w-full absolute backdrop-blur-sm z-10" />
      <div className="h-full w-full absolute flex flex-col items-center justify-center z-20">
        <ButtonComponent
          className="bg-dark-bg flex items-center rounded-md"
          onClick={() => setIsOpen(true)}
        >
          <FaLock className="text-xl mr-2" />
          <div>UNLOCK NEWS TRADING</div>
        </ButtonComponent>
      </div>
      {formatted.map((item) => (
        <ArticleComponent
          id={item.news.time.toString()}
          key={item.news.source + item.news.time}
          author={item.news.author}
          content={item.news.content}
          link={item.news.link}
          source={item.news.source}
          time={item.news.time}
          symbols={item.symbols}
        />
      ))}
    </>
  );
};

// we copy references from computed functions to a shared scope
// from the main window and the pope'd out news feed
const sharedScope: Record<string, any> = {};

export const NewsComponent = () => {
  const [locked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const markets = useAtomValue(marketsAtom);
  const loading = markets.length === 0;

  const shortcuts = useAtomValue(shortcutsAtom);
  const selectPreviousNews = useSetAtom(selectPreviousNewsAtom);
  const selectNextNews = useSetAtom(selectNextNewsAtom);
  const selectFirstNews = useSetAtom(selectFirstNewsAtom);

  const apeNews = useApeNews();
  const selectedNewsId = useAtomValue(selectedNewsAtom);
  const messages = useAtomValue(messageHistoryAtom);
  const disabledSources = useAtomValue(newsDisabledSourcesAtom);

  const account = useAtomValue(selectedAccountAtom);
  const currentExchange = `${account?.exchange}_${account?.testnet}`;

  useEffect(() => {
    if (isOpen) {
      const selectedNews = messages.find((m) => m.id === selectedNewsId);
      const [symbol] = selectedNews?.symbols || [];
      sharedScope.apeNews = apeNews;
      sharedScope.symbol = symbol;
    }
  }, [apeNews, selectedNewsId, messages, isOpen]);

  return (
    <>
      <Tooltip
        anchorId="pro"
        place="bottom"
        variant="info"
        className="z-50 font-bold"
      />
      {!disabledSources.includes(NewsSources.NewsmakerPro) && (
        <NewsmakerComponent key={`${currentExchange}_newsmaker`} />
      )}
      {!disabledSources.includes(NewsSources.TreeNews) && (
        <TreeNewsComponent key={`${currentExchange}_treenews`} />
      )}
      <GridBlockComponent
        newWindow="News feed"
        title={
          <div className="flex items-center">
            <div className="font-bold">News feed</div>
            <div className="ml-auto">
              <div
                id="pro"
                className="border-2 border-dark-border-gray-2 px-2 py-0.5 rounded-sm text-xs font-bold"
                data-tooltip-content="This feature is free during beta"
              >
                PRO
              </div>
            </div>
          </div>
        }
        onNewWindowOpen={(win) => {
          setIsOpen(true);

          const mousetrap = new Mousetrap(win.document as any);
          mousetrap.stopCallback = (_event, element) => {
            return (
              element.tagName === 'INPUT' ||
              element.tagName === 'SELECT' ||
              element.tagName === 'TEXTAREA' ||
              ('contentEditable' in element &&
                element.contentEditable === 'true')
            );
          };

          const bind = (
            key: string[],
            callback: (e: Mousetrap.ExtendedKeyboardEvent) => void
          ) => {
            mousetrap.bind(joinKeys(key), (event) => {
              event.preventDefault();
              callback(event);
            });
          };

          bind(shortcuts.previousNews, selectPreviousNews);
          bind(shortcuts.nextNews, selectNextNews);
          bind(shortcuts.selectFirstNews, selectFirstNews);

          bind(shortcuts.buyNews, () => {
            if (sharedScope.symbol) {
              sharedScope.apeNews({
                side: OrderSide.Buy,
                symbol: sharedScope.symbol,
              });
            }
          });

          bind(shortcuts.sellNews, () => {
            if (sharedScope.symbol) {
              sharedScope.apeNews({
                side: OrderSide.Sell,
                symbol: sharedScope.symbol,
              });
            }
          });
        }}
        onNewWindowClose={() => {
          setIsOpen(false);
        }}
      >
        <div className="h-full overflow-scroll no-scrollbar bg-dark-bg/70">
          {loading && <LoadingComponent />}
          {locked && <LockedNewsComponent />}
          {!locked && !loading && <UnlockedNewsComponent />}
        </div>
      </GridBlockComponent>
    </>
  );
};

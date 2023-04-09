import { useAtom } from 'jotai';
import React from 'react';

import {
  newsOldLayoutAtom,
  newsDisplayDotsAtom,
  newsAutoSelectTickerAtom,
  newsText2SpeechAtom,
  newsTradeShortcutsEnabledAtom,
  newsDisabledSourcesAtom,
} from '../../../hooks/trade/use-news-trade.hooks';
import { NewsSources } from '../../../hooks/use-news/use-news.types';
import { CheckboxComponent } from '../../ui/checkbox.component';

export const NewsSettingsCheckboxesComponent = () => {
  const [oldLayout, setOldLayout] = useAtom(newsOldLayoutAtom);
  const [dot, setDot] = useAtom(newsDisplayDotsAtom);
  const [autoSelect, setAutoSelect] = useAtom(newsAutoSelectTickerAtom);
  const [text2Speech, setText2Speech] = useAtom(newsText2SpeechAtom);
  const [tradeShortcutsEnabled, setTradeShortcutsEnabled] = useAtom(
    newsTradeShortcutsEnabledAtom
  );
  const [disabledSources, setDisabledSources] = useAtom(
    newsDisabledSourcesAtom
  );

  const toggleSource = (source: NewsSources) => () => {
    if (disabledSources.includes(source)) {
      setDisabledSources(disabledSources.filter((s) => s !== source));
    } else {
      setDisabledSources([...disabledSources, source]);
    }
  };

  const checkboxes = [
    [
      !disabledSources.includes(NewsSources.NewsmakerPro),
      toggleSource(NewsSources.NewsmakerPro),
      'Receive news from NewsmakerPro',
    ],
    [
      !disabledSources.includes(NewsSources.TreeNews),
      toggleSource(NewsSources.TreeNews),
      'Receive news from TreeNews',
    ],
    [oldLayout, setOldLayout, 'Use legacy UI for news feed'],
    [dot, setDot, 'Display news dots on charts'],
    [autoSelect, setAutoSelect, 'Automatically display news ticker chart'],
    [
      tradeShortcutsEnabled,
      setTradeShortcutsEnabled,
      'Enable news trading shortcuts (configure in shortcuts)',
    ],
    [text2Speech, setText2Speech, 'Read news out loud using text to speech'],
  ] as const;

  return (
    <>
      {checkboxes.map(([value, setValue, label]) => (
        <div key={label} className="flex items-center">
          <CheckboxComponent checked={value} onChange={setValue} />
          <div
            className="font-bold ml-4 mt-1.5 cursor-pointer select-none"
            onClick={() => setValue(!value)}
          >
            {label}
          </div>
        </div>
      ))}
    </>
  );
};

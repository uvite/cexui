import { useAtom, useAtomValue } from 'jotai';
import { orderBy } from 'lodash';
import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import Select from 'react-select';

import { marketsAtom } from '../../../app-state';
import { customTickerWordsMappingAtom } from '../../../utils/ticker-match/ticker-match.atoms';
import { tickerRegex } from '../../../utils/ticker-match/ticker-match.utils';
import { ButtonComponent } from '../../ui/button.component';

export const NewsSettingsCustomWordsComponent = () => {
  const [newWord, setNewWord] = useState('');
  const [newWordTickers, setNewWordTickers] = useState<string[]>([]);

  const tickers = useAtomValue(marketsAtom).map((m) =>
    m.symbol.replace(tickerRegex, '')
  );

  const [customWords, setCustomWords] = useAtom(customTickerWordsMappingAtom);
  const asArray = orderBy(Object.entries(customWords), ['0'], ['asc']);

  const addWord = () => {
    if (newWord?.trim?.() && !customWords[newWord]) {
      setCustomWords((prev) => ({ ...prev, [newWord]: [...newWordTickers] }));
      setNewWord('');
      setNewWordTickers([]);
    }
  };

  const removeWord = (word: string) => {
    setCustomWords((prev) => {
      const { [word]: _, ...rest } = prev;
      return rest;
    });
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setNewWord(value);
  };

  return (
    <>
      <div className="font-bold text-lg">Custom words</div>
      <p className="text-dark-text-gray text-sm py-2">
        Those words would be used to match a ticker in the news.
        <br />
        (Changing this setting will take effect on future news).
      </p>
      <table className="table table-auto w-full">
        <thead>
          <tr>
            <th className="text-left">Word</th>
            <th className="text-right">Tickers</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {asArray.map(([word, wordTickers]) => (
            <tr key={word}>
              <td className="text-left text-dark-text-gray">{word}</td>
              <td className="text-right font-mono text-sm text-dark-text-gray">
                {wordTickers.join(', ')}
              </td>
              <td className="text-right">
                <FaTimesCircle
                  className="inline text-red-500 cursor-pointer"
                  onClick={() => removeWord(word)}
                />
              </td>
            </tr>
          ))}
          {asArray.length === 0 && (
            <tr>
              <td colSpan={3} className="text-left text-dark-text-gray italic">
                No custom words
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center mt-4">
        <input
          type="text"
          className="py-1.5 w-1/5 mr-1"
          value={newWord}
          placeholder="Word"
          onChange={onInputChange}
        />
        <div className="w-3/5 mx-1">
          <Select
            id="news-custom-tickers"
            instanceId="news-custom-tickers"
            className="react-select-container w-full z-[90]"
            classNamePrefix="react-select"
            value={newWordTickers.map((t) => ({ value: t, label: t }))}
            options={tickers.map((t) => ({ value: t, label: t }))}
            isMulti={true}
            closeMenuOnSelect={false}
            isOptionDisabled={() => newWordTickers.length >= 3}
            onChange={(data) => setNewWordTickers(data.map((d) => d.value))}
          />
        </div>
        <ButtonComponent
          className="ml-1 w-1/5 h-[40px] rounded-md"
          onClick={addWord}
        >
          <span className="relative -top-0.5">Submit</span>
        </ButtonComponent>
      </div>
    </>
  );
};

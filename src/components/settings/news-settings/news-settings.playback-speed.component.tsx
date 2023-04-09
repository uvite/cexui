import { useAtom } from 'jotai';
import React from 'react';
import { Range } from 'react-range';

import { newsText2SpeechPlaybackSpeedAtom } from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsPlaybackSpeedComponent = () => {
  const [text2SpeechPlaybackSpeed, setText2SpeechPlaybackSpeed] = useAtom(
    newsText2SpeechPlaybackSpeedAtom
  );

  return (
    <div className="flex items-center mt-2">
      <div className="mr-8 font-bold">Playback speed</div>
      <div className="flex-1">
        <Range
          step={0.1}
          min={1}
          max={3}
          values={[text2SpeechPlaybackSpeed]}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="bg-dark-border-gray-2 w-full h-[3px] rounded-lg"
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="bg-dark-border-gray-2 w-4 h-4 rounded-full"
            />
          )}
          onChange={(values) => setText2SpeechPlaybackSpeed(values[0])}
        />
      </div>
      <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
        x{text2SpeechPlaybackSpeed}
      </div>
    </div>
  );
};

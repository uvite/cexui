import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import React from 'react';
import { Range } from 'react-range';
import Select from 'react-select';

import { NewsTradeType } from '../../../app.types';
import {
  newsTradeTypeAtom,
  newsTradeTwapSettingsAtom,
  newsTradeLimitSettingsAtom,
  newsTradeMarketSettingsAtom,
} from '../../../hooks/trade/use-news-trade.hooks';

export const NewsSettingsOrderTypeComponent = () => {
  const [newsTradeType, setNewsTradeType] = useAtom(newsTradeTypeAtom);
  const [twapSettings, setTwapSettings] = useAtom(newsTradeTwapSettingsAtom);
  const [limitSettings, setLimitSettings] = useAtom(newsTradeLimitSettingsAtom);
  const [marketSettings, setMarketSettings] = useAtom(newsTradeMarketSettingsAtom);

  return (
    <>
      <div className="text-lg font-bold">Order type</div>
      <p className="text-dark-text-gray py-2 text-sm">
        The order type to be used when trading from news feed.
      </p>
      <div className="flex items-center">
        <div className="mr-1 w-1/3">
          <Select
            id="order-type"
            instanceId="order-type"
            className="react-select-container z-50 w-full"
            classNamePrefix="react-select"
            name="order-type"
            isClearable={false}
            blurInputOnSelect={true}
            isSearchable={false}
            value={{
              value: newsTradeType,
              label: newsTradeType.toUpperCase(),
            }}
            options={[
              {
                value: NewsTradeType.Market,
                label: NewsTradeType.Market.toUpperCase(),
              },
              {
                value: NewsTradeType.Limit,
                label: NewsTradeType.Limit.toUpperCase(),
              },
              {
                value: NewsTradeType.Twap,
                label: NewsTradeType.Twap.toUpperCase(),
              },
              {
                value: NewsTradeType.Chase,
                label: NewsTradeType.Chase.toUpperCase(),
              },
            ]}
            onChange={(data) => {
              if (data) setNewsTradeType(data.value);
            }}
          />
        </div>
        <div className="ml-1 w-2/3">
          {newsTradeType === NewsTradeType.Market && (
            <div className="mb-2 flex items-center">
              <div className="mr-4 w-1/3 text-right text-sm font-bold">Max slippage</div>
              <div className="flex w-2/3 flex-1">
                <Range
                  step={0.05}
                  min={0}
                  max={5}
                  values={[marketSettings.maxSlippage]}
                  renderTrack={({ props, children }) => (
                    <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
                  )}
                  onChange={(values) => setMarketSettings({ maxSlippage: values[0] })}
                />
              </div>
              <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
                {marketSettings.maxSlippage > 0 ? `${marketSettings.maxSlippage.toFixed(2)}%` : `∞`}
              </div>
            </div>
          )}
          {newsTradeType === NewsTradeType.Limit && (
            <div className="mb-2 flex items-center">
              <div className="mr-4 w-1/3 text-right text-sm font-bold">Distance %</div>
              <div className="flex w-2/3 flex-1">
                <Range
                  step={0.05}
                  min={0}
                  max={5}
                  values={[limitSettings.distance]}
                  renderTrack={({ props, children }) => (
                    <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
                  )}
                  onChange={(values) => setLimitSettings({ distance: values[0] })}
                />
              </div>
              <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
                {limitSettings.distance.toFixed(2)}%
              </div>
            </div>
          )}
          {newsTradeType === NewsTradeType.Twap && (
            <>
              <div className="mb-2 flex items-center">
                <div className="mr-4 w-1/3 text-right text-sm font-bold">Duration</div>
                <div className="flex w-2/3 flex-1">
                  <Range
                    step={1}
                    min={1}
                    max={30}
                    values={[twapSettings.length]}
                    renderTrack={({ props, children }) => (
                      <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
                    )}
                    onChange={(values) =>
                      setTwapSettings((prev) => ({
                        ...prev,
                        length: values[0],
                      }))
                    }
                  />
                </div>
                <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
                  {dayjs
                    .duration(twapSettings.length, 'minutes')
                    .format(twapSettings.length >= 60 ? 'HH[h]mm[m]' : 'mm[m]')}
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 w-1/3 text-right text-sm font-bold">Lots</div>
                <div className="flex w-2/3 flex-1">
                  <Range
                    step={1}
                    min={2}
                    max={20}
                    values={[twapSettings.lotsCount]}
                    renderTrack={({ props, children }) => (
                      <div {...props} className="bg-dark-border-gray-2 h-[3px] w-full rounded-lg">
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div {...props} className="bg-dark-border-gray-2 h-4 w-4 rounded-full" />
                    )}
                    onChange={(values) =>
                      setTwapSettings((prev) => ({
                        ...prev,
                        lotsCount: values[0],
                      }))
                    }
                  />
                </div>
                <div className="text-dark-text-gray border-dark-border-gray ml-4 w-[60px] border text-center font-mono text-xs">
                  {twapSettings.lotsCount}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

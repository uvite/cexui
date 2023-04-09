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
  const [marketSettings, setMarketSettings] = useAtom(
    newsTradeMarketSettingsAtom
  );

  return (
    <>
      <div className="font-bold text-lg">Order type</div>
      <p className="text-dark-text-gray text-sm py-2">
        The order type to be used when trading from news feed.
      </p>
      <div className="flex items-center">
        <div className="w-1/3 mr-1">
          <Select
            id="order-type"
            instanceId="order-type"
            className="react-select-container w-full z-50"
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
        <div className="w-2/3 ml-1">
          {newsTradeType === NewsTradeType.Market && (
            <div className="flex items-center mb-2">
              <div className="mr-4 text-right text-sm font-bold w-1/3">
                Max slippage
              </div>
              <div className="flex flex-1 w-2/3">
                <Range
                  step={0.05}
                  min={0}
                  max={5}
                  values={[marketSettings.maxSlippage]}
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
                  onChange={(values) =>
                    setMarketSettings({ maxSlippage: values[0] })
                  }
                />
              </div>
              <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
                {marketSettings.maxSlippage > 0
                  ? `${marketSettings.maxSlippage.toFixed(2)}%`
                  : `∞`}
              </div>
            </div>
          )}
          {newsTradeType === NewsTradeType.Limit && (
            <div className="flex items-center mb-2">
              <div className="mr-4 text-right text-sm font-bold w-1/3">
                Distance %
              </div>
              <div className="flex flex-1 w-2/3">
                <Range
                  step={0.05}
                  min={0}
                  max={5}
                  values={[limitSettings.distance]}
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
                  onChange={(values) =>
                    setLimitSettings({ distance: values[0] })
                  }
                />
              </div>
              <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
                {limitSettings.distance.toFixed(2)}%
              </div>
            </div>
          )}
          {newsTradeType === NewsTradeType.Twap && (
            <>
              <div className="flex items-center mb-2">
                <div className="mr-4 text-right text-sm font-bold w-1/3">
                  Duration
                </div>
                <div className="flex flex-1 w-2/3">
                  <Range
                    step={1}
                    min={1}
                    max={30}
                    values={[twapSettings.length]}
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
                    onChange={(values) =>
                      setTwapSettings((prev) => ({
                        ...prev,
                        length: values[0],
                      }))
                    }
                  />
                </div>
                <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
                  {dayjs
                    .duration(twapSettings.length, 'minutes')
                    .format(twapSettings.length >= 60 ? 'HH[h]mm[m]' : 'mm[m]')}
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 text-right text-sm font-bold w-1/3">
                  Lots
                </div>
                <div className="flex flex-1 w-2/3">
                  <Range
                    step={1}
                    min={2}
                    max={20}
                    values={[twapSettings.lotsCount]}
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
                    onChange={(values) =>
                      setTwapSettings((prev) => ({
                        ...prev,
                        lotsCount: values[0],
                      }))
                    }
                  />
                </div>
                <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
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

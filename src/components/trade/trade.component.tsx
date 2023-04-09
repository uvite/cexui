import cx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';

import { loadedAtom } from '../../app-state';
import { tradeOptions } from '../../app.types';
import { selectedSymbolAtom, selectedTradeAtom } from '../../atoms/trade.atoms';
import { GridBlockComponent } from '../ui/grid-block.component';
import { LoadingComponent } from '../ui/loading.component';

import { AllInOneTradeComponent } from './all-in-one-trade.component';
import { ChaseTradeComponent } from './chase/chase-trade.component';
import { ScaleRiskTradeComponent } from './scale-risk-trade.component';
import { ScaleSizeTradeComponent } from './scale-size-trade.component';
import { TradeSimpleOrdersComponent } from './simple-orders.component';
import { TWAPOrderTradeComponent } from './twap/twap-trade.component';

export const TradeComponent = () => {
  const selectedSymbol = useAtomValue(selectedSymbolAtom);
  const loadedResources = useAtomValue(loadedAtom);

  const loaded = loadedResources.markets && loadedResources.tickers && loadedResources.balance;

  const [selected, setSelected] = useAtom(selectedTradeAtom);

  return (
    <>
      <Tooltip anchorId="pro-2" place="bottom" variant="info" className="z-50 font-bold" />

      <GridBlockComponent
        title={
          <div className="flex items-center">
            <div>
              <span className="mr-2 font-bold">下单</span>
              <span className="font-mono">{selectedSymbol.replace(/:.+/, '')}</span>
            </div>
            {/*<div className={cx('ml-auto', { hidden: selected === 'simple' })}>*/}
            {/*  <span*/}
            {/*    id="pro-2"*/}
            {/*    className="border-2 border-dark-border-gray-2 px-2 py-0.5 rounded-sm text-xs font-bold"*/}
            {/*    data-tooltip-content="This feature is free during beta"*/}
            {/*  >*/}
            {/*    PRO*/}
            {/*  </span>*/}
            {/*</div>*/}
          </div>
        }
      >
        {loaded ? (
          <>
            <div className="select-none px-2 pt-3">
              <Select
                id="select-trade-type"
                instanceId="select-trade-type"
                className="react-select-container bg-dark-bg rounded-md font-bold uppercase"
                classNamePrefix="react-select"
                isClearable={false}
                blurInputOnSelect={true}
                isSearchable={false}
                options={tradeOptions}
                value={tradeOptions.find((option) => option.value === selected)}
                onChange={(option) => {
                  if (option) {
                    setSelected(option.value);
                  }
                }}
              />
            </div>
            <div>
              {selected === 'scale_in_risk' && <ScaleRiskTradeComponent />}
              {selected === 'scale_in_size' && <ScaleSizeTradeComponent />}
              {selected === 'all_in_one' && <AllInOneTradeComponent />}
              {selected === 'simple' && <TradeSimpleOrdersComponent />}
              {selected === 'twap' && <TWAPOrderTradeComponent />}
              {selected === 'chase' && <ChaseTradeComponent />}
            </div>
          </>
        ) : (
          <LoadingComponent />
        )}
      </GridBlockComponent>
    </>
  );
};

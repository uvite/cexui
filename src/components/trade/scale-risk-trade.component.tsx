import cx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { Range } from 'react-range';
import { OrderSide } from 'safe-cex/dist/types';

import { privacyAtom } from '../../atoms/app.atoms';
import {
  tradeEntryTouchedAtom,
  tradeSideAtom,
  priceScaleRatioAtom,
  nbOrdersAtom,
  tradeLastTouchedAtom,
  LastTouchedInput,
  maxRiskAtom,
  riskAtom,
  selectedSymbolAtom,
  tradeFromAtom,
  tradeStopLossAtom,
  tradeTakeProfitAtom,
  quantityScaledAtom,
} from '../../atoms/trade.atoms';
import {
  scaledInRiskTradeAtom,
  useScaledInRiskTrade,
} from '../../hooks/trade/use-scale-risk-trade.hooks';
import { useGetTickerPrice } from '../../hooks/use-ticker-price.hooks';
import { easeRatioToPercent } from '../../utils/ease-ratio-percent.utils';
import { formatCurrency } from '../../utils/formatter.utils';
import { pFloat } from '../../utils/parse-float.utils';
import { toUSD } from '../../utils/to-usd.utils';
import { ButtonComponent } from '../ui/button.component';
import { OrderSideButton } from '../ui/order-side-button.component';

export const ScaleRiskTradeComponent = () => {
  const privacy = useAtomValue(privacyAtom);

  const selectedSymbol = useAtomValue(selectedSymbolAtom);
  const currSymbol = useRef(selectedSymbol);

  const getTickerPrice = useGetTickerPrice();

  const [loading, setLoading] = useState(false);
  const [entryTouched, setEntryTouched] = useAtom(tradeEntryTouchedAtom);

  const [side, setSide] = useAtom(tradeSideAtom);
  const [entry, setEntry] = useAtom(tradeFromAtom);
  const [stop, setStop] = useAtom(tradeStopLossAtom);
  const [risk, setRisk] = useAtom(riskAtom);
  const [quantityScaled, setQuantityScaled] = useAtom(quantityScaledAtom);
  const [priceScale, setPriceScale] = useAtom(priceScaleRatioAtom);
  const [nbOrders, setNbOrders] = useAtom(nbOrdersAtom);
  const [takeProfit, setTakeProfit] = useAtom(tradeTakeProfitAtom);
  const [maxRisk] = useAtom(maxRiskAtom);
  const [lastTouched, setLastTouched] = useAtom(tradeLastTouchedAtom);

  const currPrice = getTickerPrice(selectedSymbol, side);
  const entryOrCurrentPrice = entryTouched ? entry : currPrice;

  const scaleIn = useScaledInRiskTrade();
  const { totalQty, entryQty, scaledInQty, avgPrice, riskInUSD } = useAtomValue(
    scaledInRiskTradeAtom
  );

  const placeOrder = async () => {
    setLoading(true);

    try {
      await scaleIn();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedSymbol !== currSymbol.current) {
      setEntry('');
      setStop('');
      setTakeProfit('');
      setEntryTouched(false);
      currSymbol.current = selectedSymbol;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);

  return (
    <div className="px-2 py-3 text-sm h-full">
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Risk</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={0.25}
            min={0.25}
            max={maxRisk}
            values={[risk]}
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
            onChange={(values) => setRisk(values[0])}
          />
        </div>
        <div
          className={cx('ml-4 w-[70px] font-mono text-xs text-center', {
            'text-dark-green': risk < 5,
            'text-orange-500': risk >= 5 && risk < 20,
            'text-red-500': risk >= 20,
          })}
        >
          ({risk.toFixed(2)}%)
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Entry</div>
        <div className="flex items-center flex-1 w-3/4">
          <div className="flex-1">
            <input
              type="text"
              value={entryOrCurrentPrice?.toString() || ''}
              className={cx(
                'text-right w-full bg-dark-bg font-semibold font-mono',
                { 'border-blue-500': lastTouched === 'from' }
              )}
              onChange={({ target }) => {
                setEntry(target.value);
              }}
              onFocus={() => {
                setLastTouched(LastTouchedInput.From);
                setEntryTouched(true);
              }}
            />
          </div>
          <div className="ml-2">
            <button
              type="button"
              className={cx(
                'flex items-center justify-center font-bold border-2 rounded-md text-xs px-2 h-[32px] bg-slate-500/50 border-slate-500',
                {
                  'opacity-30 cursor-not-allowed': !entryTouched,
                  'cursor-pointer': entryTouched,
                }
              )}
              onClick={() => {
                setEntryTouched(false);
                setEntry('');
              }}
            >
              LAST
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">SL</div>
        <div className="w-3/4">
          <input
            type="text"
            value={stop}
            className={cx(
              'text-right w-full bg-dark-bg font-semibold font-mono',
              { 'border-blue-500': lastTouched === 'to' }
            )}
            required={true}
            onChange={({ target }) => setStop(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.To)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">TP</div>
        <div className="w-3/4">
          <input
            type="text"
            value={takeProfit}
            className={cx(
              'text-right w-full bg-dark-bg font-semibold font-mono',
              { 'border-blue-500': lastTouched === 'takeProfit' }
            )}
            required={true}
            onChange={({ target }) => setTakeProfit(target.value)}
            onFocus={() => setLastTouched(LastTouchedInput.TakeProfit)}
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Side</div>
        <div className="flex w-3/4">
          <div className="w-1/2 mr-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Buy}
              selected={side === OrderSide.Buy}
              onClick={() => setSide(OrderSide.Buy)}
            />
          </div>
          <div className="w-1/2 ml-1">
            <OrderSideButton
              className="w-full"
              side={OrderSide.Sell}
              selected={side === OrderSide.Sell}
              onClick={() => setSide(OrderSide.Sell)}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Scale ratio</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={0.01}
            min={0}
            max={1}
            values={[quantityScaled]}
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
            onChange={(values) => setQuantityScaled(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {Math.round(quantityScaled * 100)}%
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Distribution</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={0.05}
            min={1}
            max={3}
            values={[priceScale]}
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
            onChange={(values) => setPriceScale(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {easeRatioToPercent(priceScale)}
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="mr-4 text-right font-bold w-1/4">Orders Count</div>
        <div className="flex flex-1 w-3/4">
          <Range
            step={1}
            min={2}
            max={35}
            values={[nbOrders]}
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
            onChange={(values) => setNbOrders(values[0])}
          />
        </div>
        <div className="ml-4 w-[60px] font-mono text-xs text-dark-text-gray text-center border border-dark-border-gray">
          {nbOrders}
        </div>
      </div>
      <div className="flex items-center my-6">
        <div className="mr-4 text-right font-bold w-1/4" />
        <div className="flex-1 w-3/4 pr-1 text-dark-text-gray">
          <div className="flex items-center">
            <div className="font-semibold">Entry size</div>
            <div className="ml-auto font-mono text-xs">
              {privacy ? (
                <>****</>
              ) : (
                <>
                  {entryQty ? entryQty : 0} (
                  {toUSD(entryQty * pFloat(entryOrCurrentPrice))})
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Scaled size</div>
            <div className="ml-auto font-mono text-xs">
              {privacy ? (
                <>****</>
              ) : (
                <>
                  {scaledInQty ? scaledInQty : 0} (
                  {toUSD(scaledInQty * pFloat(avgPrice))})
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Total size</div>
            <div className="ml-auto font-mono text-xs">
              {privacy ? (
                <>****</>
              ) : (
                <>
                  {totalQty ? totalQty : 0} ({toUSD(totalQty * avgPrice)})
                </>
              )}
            </div>
          </div>
          <div className="flex items-center mt-1">
            <div className="font-semibold">Avg price</div>
            <div className="ml-auto font-mono text-xs">
              {formatCurrency(avgPrice ? avgPrice : 0, 'usd')}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-semibold">Est. loss</div>
            <div className="ml-auto font-mono text-xs">
              {privacy
                ? `${risk.toFixed(2)}%`
                : formatCurrency(riskInUSD, 'usd')}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-3 w-full">
        <ButtonComponent
          className="w-full bg-dark-bg flex items-center justify-center uppercase rounded-md"
          size="small"
          disabled={!totalQty}
          loading={loading}
          onClick={placeOrder}
        >
          {side}
          {totalQty > 0 && !privacy && (
            <span className="font-mono text-xs ml-2">
              ({totalQty} {selectedSymbol?.replace(/\/.+/, '')})
            </span>
          )}
        </ButtonComponent>
      </div>
    </div>
  );
};

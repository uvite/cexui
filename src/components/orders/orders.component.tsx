import cx from 'clsx';
import { useAtomValue } from 'jotai';
import { orderBy } from 'lodash';
import React, { memo, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { OrderSide } from 'safe-cex/dist/types';

import { loadedAtom, ordersAtom, selectedAtom } from '../../app-state';
import {
  useCancelAllOrders,
  useCancelOrders,
} from '../../hooks/use-cancel-orders.hooks';
import { ActionButtonComponent } from '../ui/button.component';
import { GridBlockComponent } from '../ui/grid-block.component';
import { LoadingComponent } from '../ui/loading.component';

import { OrderRowComponent } from './order-row.component';

const TableComponent = memo((props) => (
  <table {...props} className="table-auto w-full" />
));

const TableRowComponent = memo((props) => (
  <tr {...props} className="text-dark-text-white" />
));

export const OrdersComponent = () => {
  const [displayAll, setDisplayAll] = useState(true);

  const allOrders = useAtomValue(ordersAtom);
  const { symbol, orders: symbolOrders } = useAtomValue(selectedAtom);
  const { orders: loaded } = useAtomValue(loadedAtom);

  const orders = orderBy(
    displayAll ? allOrders : symbolOrders,
    ['symbol', 'price'],
    ['asc', 'desc']
  );

  const asks = orders.filter((o) => o.side === OrderSide.Sell);
  const bids = orders.filter((o) => o.side === OrderSide.Buy);

  const cancelOrders = useCancelOrders();
  const cancelAllOrders = useCancelAllOrders();

  return (
    <GridBlockComponent
      newWindow="Orders"
      title={
        <div className="flex items-center">
          <div>
            <span className="font-bold mr-2">Orders</span>
            <span className="text-sm text-dark-text-gray font-mono font-semibold">
              ({asks.length + bids.length})
            </span>
          </div>
          <div className="ml-auto flex font-mono font-semibold text-xs">
            <div
              className={cx(
                'border border-r-0 px-2 py-1 cursor-pointer',
                !displayAll
                  ? 'border-dark-border-gray'
                  : 'border-dark-border-gray-2'
              )}
              onClick={() => setDisplayAll(true)}
            >
              ALL
            </div>
            <div className="w-[1px] h-[26px] bg-dark-border-gray-2" />
            <div
              className={cx(
                'border border-l-0 px-2 py-1 cursor-pointer',
                displayAll
                  ? 'border-dark-border-gray'
                  : 'border-dark-border-gray-2'
              )}
              onClick={() => setDisplayAll(false)}
            >
              {symbol.replace(/:.+/, '')}
            </div>
          </div>
        </div>
      }
    >
      <div className="py-3 px-2 h-full relative select-none">
        <div className="w-full h-full">
          {loaded ? (
            <div className="h-full w-full flex flex-col">
              <TableVirtuoso
                className="no-scrollbar"
                data={orders}
                totalCount={orders.length}
                increaseViewportBy={{ top: 300, bottom: 300 }}
                components={{
                  Table: TableComponent,
                  TableRow: TableRowComponent,
                }}
                fixedHeaderContent={() => (
                  <tr className="font-mono text-xs text-dark-text-gray bg-dark-bg-2">
                    <th className="pb-4 text-left">Symbol</th>
                    <th className="pb-4 text-left">Side</th>
                    <th className="pb-4 text-right">Price</th>
                    <th className="pb-4 text-right">Size</th>
                    <th className="text-right" />
                  </tr>
                )}
                itemContent={(_index, order) => (
                  <OrderRowComponent order={order} />
                )}
              />
              <div className="w-full pt-2">
                <div className="w-11/12 mx-auto">
                  <ActionButtonComponent
                    className="text-red-500 border-red-500 font-mono text-xs font-semibold w-full"
                    onClick={() =>
                      displayAll ? cancelAllOrders() : cancelAllOrders(symbol)
                    }
                  >
                    CANCEL ALL
                  </ActionButtonComponent>
                </div>
                <div className="flex w-11/12 mx-auto mt-1">
                  <ActionButtonComponent
                    className="text-red-500 border-red-500 font-mono text-xs font-semibold w-full mr-0.5"
                    onClick={() => cancelOrders(bids)}
                  >
                    CANCEL BIDS ({bids.length})
                  </ActionButtonComponent>
                  <ActionButtonComponent
                    className="text-red-500 border-red-500 font-mono text-xs font-semibold w-full ml-0.5"
                    onClick={() => cancelOrders(asks)}
                  >
                    CANCEL ASKS ({asks.length})
                  </ActionButtonComponent>
                </div>
              </div>
            </div>
          ) : (
            <LoadingComponent />
          )}
        </div>
      </div>
    </GridBlockComponent>
  );
};

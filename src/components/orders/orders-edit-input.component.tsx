import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import type { Order, UpdateOrderOpts } from 'safe-cex/dist/types';

import { ConnectorContext } from '../../hooks/use-exchange-connector.hooks';
import { errorToast } from '../../notifications/error.toast';
import { updatedOrderToast } from '../../notifications/updated-order.toast';
import { pFloat } from '../../utils/parse-float.utils';

export const OrdersEditInputComponent = ({
  order,
  type,
}: {
  order: Order;
  type: 'amount' | 'price';
}) => {
  const value = type === 'amount' ? order.amount : order.price;

  const connector = useContext(ConnectorContext);
  const $input = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState(value.toString());
  const [displayInput, setDisplayInput] = useState(false);

  const handleClick = () => {
    setDisplayInput(true);
    setTimeout(() => {
      $input.current?.focus();
      $input.current?.select();
    }, 0);
  };

  const handleBlur = () => {
    setDisplayInput(false);
    setInputValue(value.toString());
  };

  const handleUpdate = async () => {
    if (connector) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const data = {
        order,
        update: { [type]: pFloat(inputValue) },
      } as UpdateOrderOpts;

      try {
        await connector.updateOrder(data);
        updatedOrderToast(data);
      } catch (err: any) {
        errorToast(err.message);
      } finally {
        handleBlur();
      }
    }
  };

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Escape') handleBlur();
    if (key === 'Enter') handleUpdate();
  };

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  if (displayInput) {
    return (
      <span className="flex items-center justify-end">
        <input
          ref={$input}
          type="text"
          className="w-[100px] bg-transparent text-right"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="bg-dark-green ml-1 cursor-pointer rounded-sm p-0.5" onClick={handleUpdate}>
          <FaCheck />
        </span>
        <span className="ml-1 cursor-pointer rounded-sm bg-red-500 p-0.5" onClick={handleBlur}>
          <FaTimes />
        </span>
      </span>
    );
  }

  return (
    <span
      className="cursor-text underline decoration-dotted underline-offset-4"
      onClick={handleClick}
    >
      {type === 'amount' && order.filled > 0 ? `${order.filled}/${value}` : `${value}`}
    </span>
  );
};

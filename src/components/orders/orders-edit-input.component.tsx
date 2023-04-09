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
          className="bg-transparent text-right w-[100px]"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
        <span
          className="bg-dark-green p-0.5 rounded-sm ml-1 cursor-pointer"
          onClick={handleUpdate}
        >
          <FaCheck />
        </span>
        <span
          className="bg-red-500 p-0.5 rounded-sm ml-1 cursor-pointer"
          onClick={handleBlur}
        >
          <FaTimes />
        </span>
      </span>
    );
  }

  return (
    <span
      className="cursor-text underline underline-offset-4 decoration-dotted"
      onClick={handleClick}
    >
      {type === 'amount' && order.filled > 0
        ? `${order.filled}/${value}`
        : `${value}`}
    </span>
  );
};

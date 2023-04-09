import cx from 'clsx';
import React from 'react';
import { BiCheckboxChecked, BiCheckbox } from 'react-icons/bi';

export const CheckboxComponent = ({
  className,
  checked,
  onChange,
}: {
  className?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <div className={className}>
      <span
        className={cx('cursor-pointer select-none text-4xl -ml-2', {
          'text-dark-text-white': checked,
          'text-dark-text-white/50': !checked,
        })}
        onClick={() => onChange(!checked)}
      >
        {checked ? (
          <BiCheckboxChecked className="inline" />
        ) : (
          <BiCheckbox className="inline" />
        )}
      </span>
    </div>
  );
};

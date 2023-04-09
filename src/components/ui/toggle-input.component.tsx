import cx from 'clsx';
import React from 'react';

export const ToggleInputComponent = ({
  oneButton,
  labelYes = 'Yes',
  labelNo = 'No',
  label,
  disabled,
  value,
  onChange,
}: {
  label?: string;
  labelYes?: string;
  labelNo?: string;
  disabled?: boolean;
  oneButton?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  if (oneButton) {
    return (
      <button
        type="button"
        disabled={disabled}
        className={cx(
          'flex items-center justify-center font-bold uppercase border-2 rounded-md transition-opacity px-2 bg-slate-500/50 border-slate-500 w-full',
          {
            'opacity-100': value,
            'opacity-30': !value,
            'cursor-pointer': !disabled,
            'cursor-not-allowed': disabled,
          }
        )}
        onClick={() => onChange(!value)}
      >
        {label || (value ? labelYes : labelNo)}
      </button>
    );
  }

  return (
    <div
      className={cx('grid grid-cols-2 gap-2 w-full', {
        'opacity-30': disabled,
      })}
    >
      <button
        type="button"
        disabled={disabled}
        className={cx(
          'flex items-center justify-center font-bold uppercase border-2 rounded-md hover:opacity-100 transition-opacity cursor-pointer px-2 bg-slate-500/50 border-slate-500',
          {
            'opacity-100': value,
            'opacity-30': !value,
          }
        )}
        onClick={() => onChange(true)}
      >
        {labelYes}
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cx(
          'flex items-center justify-center font-bold uppercase border-2 rounded-md hover:opacity-100 transition-opacity cursor-pointer px-2 bg-slate-500/50 border-slate-500',
          {
            'opacity-100': !value,
            'opacity-30': value,
          }
        )}
        onClick={() => onChange(false)}
      >
        {labelNo}
      </button>
    </div>
  );
};

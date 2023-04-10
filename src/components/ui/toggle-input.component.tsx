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
          'flex w-full items-center justify-center rounded-md border-2 border-slate-500 bg-slate-500/50 px-2 font-bold uppercase transition-opacity',
          {
            'opacity-100': value,
            'opacity-30': !value,
            'cursor-pointer': !disabled,
            'cursor-not-allowed': disabled,
          },
        )}
        onClick={() => onChange(!value)}
      >
        {label || (value ? labelYes : labelNo)}
      </button>
    );
  }

  return (
    <div
      className={cx('grid w-full grid-cols-2 gap-2', {
        'opacity-30': disabled,
      })}
    >
      <button
        type="button"
        disabled={disabled}
        className={cx(
          'flex cursor-pointer items-center justify-center rounded-md border-2 border-slate-500 bg-slate-500/50 px-2 font-bold uppercase transition-opacity hover:opacity-100',
          {
            'opacity-100': value,
            'opacity-30': !value,
          },
        )}
        onClick={() => onChange(true)}
      >
        {labelYes}
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cx(
          'flex cursor-pointer items-center justify-center rounded-md border-2 border-slate-500 bg-slate-500/50 px-2 font-bold uppercase transition-opacity hover:opacity-100',
          {
            'opacity-100': !value,
            'opacity-30': value,
          },
        )}
        onClick={() => onChange(false)}
      >
        {labelNo}
      </button>
    </div>
  );
};

import cx from 'clsx';
import React from 'react';
import { AiOutlineDoubleRight } from 'react-icons/ai';
import { CgSpinnerTwoAlt } from 'react-icons/cg';

export const ButtonComponent = ({
  type = 'button',
  children,
  loading,
  className,
  onClick,
  disabled,
  size = 'base',
  selected = false,
}: {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
  size?: 'base' | 'small' | 'xsmall';
  loading?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  selected?: boolean;
}) => {
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      className={cx(
        'border-dark-border-gray group border-2 font-bold outline-none transition-colors duration-300 ease-in-out',
        'hover:border-dark-blue hover:bg-dark-blue hover:cursor-pointer',
        'disabled:hover:border-dark-border-gray disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:bg-transparent',
        {
          'px-3 py-2': size === 'base',
          'px-2 py-1 text-sm': size === 'small',
          'px-2 py-1 text-xs': size === 'xsmall',
          'animate-pulse': loading,
          'border-dark-blue bg-dark-blue': selected,
        },
        className,
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {type === 'submit' ? (
        <div className={cx('flex items-center', size === 'small' ? 'px-2' : 'px-3')}>
          {loading ? (
            <>
              <CgSpinnerTwoAlt className="animate-spin-slow mr-2" />
              <div>Loading...</div>
            </>
          ) : (
            <>
              <AiOutlineDoubleRight
                className={cx(
                  'mr-2 transition-transform duration-300 ease-in-out will-change-transform group-hover:translate-x-[2px]',
                  size === 'small' ? 'text-base' : 'text-lg',
                )}
              />
              <div>{children}</div>
            </>
          )}
        </div>
      ) : (
        <>{children}</>
      )}
    </button>
  );
};

export const ActionButtonComponent = ({
  onClick,
  children,
  className,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      className={cx(
        'border-2 px-3 py-1 text-xs font-bold opacity-70 transition-opacity',
        { 'cursor-not-allowed': disabled },
        { 'hover:opacity-100': !disabled },
        className,
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const SmallActionButtonComponent = ({
  onClick,
  children,
  className,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      className={cx(
        'ml-auto border-2 px-2 py-[1px] text-[11px] font-semibold opacity-70 transition-opacity',
        { 'cursor-not-allowed': disabled },
        { 'hover:opacity-100': !disabled },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

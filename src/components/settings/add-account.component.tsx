import cx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BiErrorCircle, BiInfoCircle } from 'react-icons/bi';
import Toggle from 'react-toggle';
import { createExchange } from 'safe-cex';

import {
  accountsAtom,
  addAccountAtom,
  Exchange,
  exchanges,
  exchangesLabel,
  exchangesLogo,
  exchangesRef,
} from '../../hooks/use-accounts.hooks';
import { EventName, useAnalytics } from '../../hooks/use-analytics.hooks';
import { logsAtom, LogSeverity } from '../../hooks/use-logs.hooks';
import { ButtonComponent } from '../ui/button.component';

interface FormValues {
  name: string;
  key: string;
  secret: string;
  testnet: boolean;
  applicationId?: string;
}

export const AddAccountComponent = ({ onBack }: { onBack: () => void }) => {
  const [selectedExchange, setExchange] = useState(Exchange.Woo);

  const log = useSetAtom(logsAtom);
  const track = useAnalytics();

  const accounts = useAtomValue(accountsAtom);
  const addAccount = useSetAtom(addAccountAtom);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: FormValues) => {
    const exchange = createExchange(selectedExchange, {
      key: data.key,
      secret: data.secret,
      testnet: data.testnet,
      applicationId: data.applicationId,
    });

    exchange.once('error', (error: any) => {
      const err = typeof error === 'string' ? error : JSON.stringify(error);
      log(`[EXCHANGE] ${err}`, LogSeverity.Error);
      track(EventName.AddExchangeAccountError, {
        exchange: selectedExchange,
        testnet: data.testnet,
        error: err,
      });
    });

    const errMessage = await exchange.validateAccount();
    exchange.dispose();

    if (errMessage) {
      setError('key', { message: errMessage });
      return;
    }

    track(EventName.AddExchangeAccount, {
      exchange: selectedExchange,
      testnet: data.testnet,
    });

    addAccount({
      exchange: selectedExchange,
      name: data.name,
      key: data.key,
      secret: data.secret,
      testnet: data.testnet,
      applicationId: data.applicationId,
      selected: true,
    });

    onBack();
  };

  return (
    <div className="px-2 py-3">
      <div className="flex items-center justify-center mb-6 font-bold">
        {exchanges.map((exchange) => (
          <div
            key={exchange}
            className={cx(
              'w-1/3 text-center border-b-2 transition-color uppercase py-2 font-mono cursor-pointer hover:bg-dark-bg-2',
              {
                'border-b-sky-300': exchange === selectedExchange,
                'border-b-transparent': exchange !== selectedExchange,
              }
            )}
            onClick={() => setExchange(exchange)}
          >
            {exchange === Exchange.Woo ? (
              <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#40ff80] to-[#39e6d7]">
                WOO X
              </span>
            ) : (
              exchangesLabel[exchange]
            )}
          </div>
        ))}
      </div>
      <div className="w-1/3 mx-auto mb-6">
        <div className="h-[50px]">
          <img
            className="h-full w-auto mx-auto"
            src={exchangesLogo[selectedExchange]}
            alt={selectedExchange}
          />
        </div>
      </div>
      <div className="text-center mb-5">
        <a
          className="p-2 rounded-md border-dark-blue bg-dark-blue/30 border-2 text-sm font-bold inline-flex items-center underline underline-offset-4"
          href={exchangesRef[selectedExchange].help}
          target="_blank"
          rel="noreferrer"
        >
          <BiInfoCircle className="text-2xl mr-2" /> How to get your API keys
        </a>
      </div>
      <form
        className="w-1/2 mx-auto font-mono"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full text-sm mb-2">
          <input
            type="text"
            placeholder="Account name (e.g. Main)"
            className={cx('w-full', { 'border-red-500': errors.name })}
            {...register('name', {
              required: 'Name is missing',
              validate: (v) =>
                accounts.find((a) => a.name === v)
                  ? 'Account name already exists'
                  : true,
            })}
          />
        </div>
        {selectedExchange === Exchange.Woo && (
          <div className="w-full text-sm mb-2">
            <input
              type="text"
              placeholder="Application ID (Exchange)"
              className={cx('w-full', {
                'border-red-500': errors.applicationId,
              })}
              {...register('applicationId', {
                required: 'applicationId is missing',
                validate: (v) =>
                  accounts.find((a) => a.applicationId === v)
                    ? 'applicationId key already exists'
                    : true,
              })}
            />
          </div>
        )}
        <div className="w-full text-sm mb-2">
          <input
            type="text"
            placeholder="API Key (Exchange)"
            className={cx('w-full', { 'border-red-500': errors.key })}
            {...register('key', {
              required: 'Key is missing',
              validate: (v) =>
                accounts.find((a) => a.key === v)
                  ? 'Account key already exists'
                  : true,
            })}
          />
        </div>
        <div className="w-full text-sm mb-4">
          <input
            type="password"
            placeholder="Secret (Exchange)"
            className={cx('w-full', { 'border-red-500': errors.secret })}
            {...register('secret', { required: 'Secret is missing' })}
          />
        </div>
        <div className="w-full text-sm flex justify-center items-center">
          <div className="mx-2 uppercase font-bold text-dark-border-gray-2 mb-[2px]">
            Testnet
          </div>
          <div className="mx-2">
            <Controller
              name="testnet"
              control={control}
              render={({ field }) => (
                <Toggle
                  defaultChecked={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                  }}
                />
              )}
            />
          </div>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="text-red-500 font-medium text-xs mt-2">
            {Object.entries(errors).map(([, error]) => (
              <div key={error.message as string} className="flex items-start">
                <span className="mr-2">
                  <BiErrorCircle />
                </span>
                <span>{error.message as string}</span>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-6 flex items-center justify-center">
          {accounts.length > 0 && (
            <ButtonComponent
              size="small"
              className="uppercase mx-2"
              onClick={() => onBack()}
            >
              Back
            </ButtonComponent>
          )}
          <ButtonComponent
            size="small"
            type="submit"
            className="uppercase mx-2"
          >
            Connect
          </ButtonComponent>
        </div>
        <div className="mt-6 text-center">
          <a
            className="text-sm font-semibold border-b border-dotted"
            href={exchangesRef[selectedExchange].link}
            target="_blank"
            rel="noreferrer"
          >
            Create an account on{' '}
            <span className="capitalize">
              {exchangesLabel[selectedExchange]}
            </span>
          </a>
          <div className="text-xs text-dark-text-gray mt-2">
            ({exchangesRef[selectedExchange].label})
          </div>
        </div>
      </form>
    </div>
  );
};

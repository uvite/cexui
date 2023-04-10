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
      <div className="mb-6 flex items-center justify-center font-bold">
        {exchanges.map((exchange) => (
          <div
            key={exchange}
            className={cx(
              'transition-color hover:bg-dark-bg-2 w-1/3 cursor-pointer border-b-2 py-2 text-center font-mono uppercase',
              {
                'border-b-sky-300': exchange === selectedExchange,
                'border-b-transparent': exchange !== selectedExchange,
              },
            )}
            onClick={() => setExchange(exchange)}
          >
            {exchange === Exchange.Woo ? (
              <span className="bg-gradient-to-r from-[#40ff80] to-[#39e6d7] bg-clip-text text-2xl text-transparent">
                WOO X
              </span>
            ) : (
              exchangesLabel[exchange]
            )}
          </div>
        ))}
      </div>
      <div className="mx-auto mb-6 w-1/3">
        <div className="h-[50px]">
          <img
            className="mx-auto h-full w-auto"
            src={exchangesLogo[selectedExchange]}
            alt={selectedExchange}
          />
        </div>
      </div>
      {/*<div className="mb-5 text-center">*/}
      {/*  <a*/}
      {/*    className="border-dark-blue bg-dark-blue/30 inline-flex items-center rounded-md border-2 p-2 text-sm font-bold underline underline-offset-4"*/}
      {/*    href={exchangesRef[selectedExchange].help}*/}
      {/*    target="_blank"*/}
      {/*    rel="noreferrer"*/}
      {/*  >*/}
      {/*    <BiInfoCircle className="mr-2 text-2xl" /> How to get your API keys*/}
      {/*  </a>*/}
      {/*</div>*/}
      <form className="mx-auto w-1/2 font-mono" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2 w-full text-sm">
          <input
            type="text"
            placeholder="Account name (e.g. Main)"
            className={cx('w-full', { 'border-red-500': errors.name })}
            {...register('name', {
              required: 'Name is missing',
              validate: (v) =>
                accounts.find((a) => a.name === v) ? 'Account name already exists' : true,
            })}
          />
        </div>
        {selectedExchange === Exchange.Woo && (
          <div className="mb-2 w-full text-sm">
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
        <div className="mb-2 w-full text-sm">
          <input
            type="text"
            placeholder="API Key (Exchange)"
            className={cx('w-full', { 'border-red-500': errors.key })}
            {...register('key', {
              required: 'Key is missing',
              validate: (v) =>
                accounts.find((a) => a.key === v) ? 'Account key already exists' : true,
            })}
          />
        </div>
        <div className="mb-4 w-full text-sm">
          <input
            type="password"
            placeholder="Secret (Exchange)"
            className={cx('w-full', { 'border-red-500': errors.secret })}
            {...register('secret', { required: 'Secret is missing' })}
          />
        </div>
        <div className="flex w-full items-center justify-center text-sm">
          <div className="text-dark-border-gray-2 mx-2 mb-[2px] font-bold uppercase">Testnet</div>
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
          <div className="mt-2 text-xs font-medium text-red-500">
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
        <div className="mt-6 flex items-center justify-center text-center">
          {accounts.length > 0 && (
            <ButtonComponent size="small" className="mx-2 uppercase" onClick={() => onBack()}>
              Back
            </ButtonComponent>
          )}
          <ButtonComponent size="small" type="submit" className="mx-2 uppercase">
            Connect
          </ButtonComponent>
        </div>
        {/*<div className="mt-6 text-center">*/}
        {/*  <a*/}
        {/*    className="border-b border-dotted text-sm font-semibold"*/}
        {/*    href={exchangesRef[selectedExchange].link}*/}
        {/*    target="_blank"*/}
        {/*    rel="noreferrer"*/}
        {/*  >*/}
        {/*    Create an account on{' '}*/}
        {/*    <span className="capitalize">{exchangesLabel[selectedExchange]}</span>*/}
        {/*  </a>*/}
        {/*  <div className="text-dark-text-gray mt-2 text-xs">*/}
        {/*    ({exchangesRef[selectedExchange].label})*/}
        {/*  </div>*/}
        {/*</div>*/}
      </form>
    </div>
  );
};

import React from 'react';
import { TiTick } from 'react-icons/ti';
import Modal from 'react-modal';

import { ButtonComponent } from '../ui/button.component';

const modalStyles: Modal['props']['style'] = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 0,
    padding: 0,
    background: 'transparent',
  },
  overlay: {
    background: 'rgba(17, 17, 17, 0.2)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
  },
};

const included = [
  'Crypto projects blog post & socials',
  'Exchanges blog post & listings',
  'Influent CT traders tweets',
  'Traditionnal market news',
  'Macro news & indicator releases',
];

export const SubscribeModalComponent = ({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} style={modalStyles} onRequestClose={onRequestClose}>
      <div className="bg-dark-bg w-[80vw] max-w-[800px] px-8 py-6">
        <h1 className="mb-8 text-center text-3xl font-bold">Subscribe to news trading</h1>
        <p className="text-left">
          News trading is a type of strategy used by financial traders who try to capitalize on
          market movements caused by events or news releases.
          <br />
          <br />
          The goal of news trading is to take advantage of short-term price movements that can occur
          in response to news events.
          <br />
          <br />
          We are tracking in real-time, identifying the correspondant ticker, and re-distributing
          the news directly into the terminal.
        </p>
        <ul className="my-6 pl-4">
          {included.map((item) => (
            <li key={item} className="flex items-center">
              <TiTick className="text-dark-green text-xl" />
              <span className="ml-2 text-lg font-semibold">{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex">
          <div className="border-dark-border-gray bg-dark-bg-2 mr-1 w-1/3 rounded-md border px-2 py-3">
            <h2 className="text-xl font-bold">Trial</h2>
            <p className="text-dark-text-gray">Start a 7-Day trial</p>
            <div className="mt-6 text-center">
              <ButtonComponent className="bg-dark-bg rounded-md">
                Get started for $9
              </ButtonComponent>
            </div>
          </div>
          <div className="border-dark-border-gray bg-dark-bg-2 mx-1 w-1/3 rounded-md border px-2 py-3">
            <h2 className="text-xl font-bold">Monthly</h2>
            <p className="text-dark-text-gray">Pay as you go</p>
            <div className="mt-6 text-center">
              <ButtonComponent className="bg-dark-bg rounded-md">Subscribe for $49</ButtonComponent>
            </div>
          </div>
          <div className="border-dark-border-gray bg-dark-bg-2 ml-1 w-1/3 rounded-md border px-2 py-3">
            <h2 className="text-xl font-bold">
              Founder
              <span className="relative -top-0.5 ml-2 text-xs">(limited)</span>
            </h2>
            <p className="text-dark-text-gray">Everything included forever</p>
            <div className="mt-6 text-center">
              <ButtonComponent className="bg-dark-bg rounded-md">One time $499</ButtonComponent>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-dark-text-gray cursor-pointer underline" onClick={onRequestClose}>
            Maybe later
          </span>
        </div>
      </div>
    </Modal>
  );
};

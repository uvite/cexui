import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { IoLogoGameControllerA, IoMdRocket } from 'react-icons/io';
import { MdMoneyOff, MdOutlinePrivacyTip } from 'react-icons/md';
import { useScramble } from 'use-scramble';

import { exchangesRef } from '../../hooks/use-accounts.hooks';

const tagLines = [
  'Revolutionize your trading strategy with our tools',
  'Experience a new level of trading with our platform',
  'Maximize your profits with our cryptocurrency trading terminal',
  'Trade smarter with our innovative news trading tools',
  'Get ahead of the competition with our news trading platform',
  'Trade with confidence using our powerful tools and analysis',
  'Never miss an opportunity with our up-to-the-minute news alerts',
  'The ultimate tool for cryptocurrency news trading',
  'Elevate your trading game with our advanced news trading system',
  'The smart way to trade cryptocurrency news',
];

const features = [
  {
    Icon: MdOutlinePrivacyTip,
    title: 'Secure & privacy focused',
    description: 'We do not store your API keys',
  },
  {
    Icon: IoMdRocket,
    title: 'Ultra-low latency',
    description: 'Runs entirely in your browser',
  },
  {
    Icon: IoLogoGameControllerA,
    title: 'Cutting-edge tools',
    description: 'Simple & innovative trading tools',
  },
  {
    Icon: MdMoneyOff,
    title: 'Free during BETA',
    description: 'No credit card required',
  },
];

export const HomeHeroComponent = () => {
  const [idx, setIdx] = useState(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const { ref } = useScramble({
    text: tagLines[idx],
    speed: 1,
    tick: 1,
    step: 2,
    scramble: 2,
    seed: 2,
    onAnimationEnd: () => {
      timeoutId.current = setTimeout(() => setIdx((idx + 1) % tagLines.length), 5000);
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto mt-12 max-w-7xl px-8 sm:mt-24">
      <div className="flex items-center">
        <div className="mx-auto max-w-[650px] sm:shrink-0 lg:mx-0">
          <h1
            className="h-[96px] overflow-hidden text-2xl font-black tracking-wider sm:h-[80px] sm:text-4xl"
            ref={ref}
          >
            {tagLines[0]}
          </h1>
          <p className="mb-12 mt-8 text-sm leading-relaxed tracking-wide sm:text-base">
            Our trading terminal is your gateway to success in the fast-paced world of
            cryptocurrency news trading, with innovative tools and features to help you stay ahead
            of the curve.
          </p>
          <div className="grid gap-y-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center">
                <feature.Icon className="text-4xl" />
                <div className="ml-4">
                  <div className="font-semibold">{feature.title}</div>
                  <div className="text-dark-text-gray text-sm">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ml-auto hidden lg:block">
          <Image alt="tuleep.trade preview" src="/mac.png" width={630} height={399} />
        </div>
      </div>
      <div className="mt-12 sm:mt-16">
        <div className="text-dark-text-white font-mono text-sm font-bold uppercase tracking-widest">
          # Suported exchanges
        </div>
        <div className="mt-4 flex items-center">
          <a
            href={exchangesRef.binance.link}
            className="relative left-[-6px] top-[3px] mr-4 opacity-70 transition-opacity hover:opacity-100"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="binance" src="/binance.png" width={996 / 5} height={217 / 5} />
          </a>
          <a
            href={exchangesRef.bybit.link}
            className="mr-5 opacity-70 transition-opacity hover:opacity-100"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="bybit" src="/bybit.png" width={2091 / 20} height={776 / 20} />
          </a>
          <a
            href={exchangesRef.woo.link}
            className="relative top-[3px] opacity-70 transition-opacity hover:opacity-100"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="woox" src="/woo.svg" width={396 / 3} height={84 / 3} />
          </a>
        </div>
      </div>
    </div>
  );
};

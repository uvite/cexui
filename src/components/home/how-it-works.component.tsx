import React from 'react';
import { AiFillRocket } from 'react-icons/ai';
import { FiHelpCircle } from 'react-icons/fi';

import { useSignIn } from '../../hooks/use-signin.hooks';

export const HowItWorksComponent = () => {
  const signIn = useSignIn();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-0">
      <div className="-mx-8 flex flex-wrap">
        <div className="w-full px-8 lg:w-1/2">
          <div className="border-b-dark-border-gray mb-12 border-b-2 pb-12 lg:mb-0 lg:border-b-0 lg:pb-0">
            <h2 id="how-it-works" className="font-heading mb-4 text-3xl font-bold lg:text-4xl">
              What is it?
            </h2>
            <p className="text-dark-border-gray-2 mb-8 leading-loose">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              It's a powerful terminal for traders that provides access to multiple exchanges,
              making it easy for traders to manage their portfolio and execute trades on a variety
              of platforms.
              <br />
              With a focus on news trading, we provide real-time updates and analysis of market
              news, allowing traders to make informed decisions and take advantage of market
              opportunities as they arise.
              <br />
              The terminal is user-friendly and intuitive, with a range of features designed to help
              traders make the most of their trades.
              <br />
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Whether you're a seasoned pro or new to the world of trading, tuleep is a valuable
              tool for anyone looking to stay on top of the market.
            </p>
            <div className="ml-auto">
              <div className="flex items-center">
                <a
                  className="border-dark-bg-2 hover:border-dark-blue mr-2 flex cursor-pointer items-center rounded-md border-2 px-2 py-1 font-bold transition-colors"
                  href="https://docs.tuleep.trade"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiHelpCircle className="mr-2" />
                  Learn more
                </a>
                <a
                  className="border-dark-bg-2 hover:border-dark-blue flex cursor-pointer items-center rounded-md border-2 px-2 py-1 font-bold transition-colors"
                  onClick={signIn('home__how_it_works')}
                >
                  <AiFillRocket className="mr-2" />
                  Start trading
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full px-8 lg:w-1/2">
          <ul className="space-y-12">
            <li className="-mx-4 flex">
              <div className="px-4">
                <span className="font-heading mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                  1
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">Register</h3>
                <p className="text-dark-border-gray-2 leading-loose">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Create an account with your e-mail to access the terminal interface, we won't spam
                  you.
                </p>
              </div>
            </li>
            <li className="-mx-4 flex">
              <div className="px-4">
                <span className="font-heading mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                  2
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">Connect to your exchange</h3>
                <p className="text-dark-border-gray-2 leading-loose">
                  Funds are SAFU, we do not store API keys on our servers, everything is stored in
                  your browser.
                </p>
              </div>
            </li>
            <li className="-mx-4 flex">
              <div className="px-4">
                <span className="font-heading mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                  3
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">Start trading</h3>
                <p className="text-dark-border-gray-2 leading-loose">
                  You are now ready to place your first trade with tuleep.trade, we wish you good
                  luck and all the best on the markets!
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

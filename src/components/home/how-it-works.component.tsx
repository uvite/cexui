import React from 'react';
import { AiFillRocket } from 'react-icons/ai';
import { FiHelpCircle } from 'react-icons/fi';

import { useSignIn } from '../../hooks/use-signin.hooks';

export const HowItWorksComponent = () => {
  const signIn = useSignIn();

  return (
    <div className="max-w-7xl px-4 pt-0 pb-8 mx-auto">
      <div className="flex flex-wrap -mx-8">
        <div className="w-full px-8 lg:w-1/2">
          <div className="pb-12 mb-12 border-b-2 border-b-dark-border-gray lg:mb-0 lg:pb-0 lg:border-b-0">
            <h2
              id="how-it-works"
              className="mb-4 text-3xl font-bold lg:text-4xl font-heading"
            >
              What is it?
            </h2>
            <p className="mb-8 leading-loose text-dark-border-gray-2">
              It's a powerful terminal for traders that provides access to
              multiple exchanges, making it easy for traders to manage their
              portfolio and execute trades on a variety of platforms.
              <br />
              With a focus on news trading, we provide real-time updates and
              analysis of market news, allowing traders to make informed
              decisions and take advantage of market opportunities as they
              arise.
              <br />
              The terminal is user-friendly and intuitive, with a range of
              features designed to help traders make the most of their trades.
              <br />
              Whether you're a seasoned pro or new to the world of trading,
              tuleep is a valuable tool for anyone looking to stay on top of the
              market.
            </p>
            <div className="ml-auto">
              <div className="flex items-center">
                <a
                  className="border-2 border-dark-bg-2 px-2 py-1 font-bold flex items-center rounded-md mr-2 hover:border-dark-blue transition-colors cursor-pointer"
                  href="https://docs.tuleep.trade"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiHelpCircle className="mr-2" />
                  Learn more
                </a>
                <a
                  className="border-2 border-dark-bg-2 px-2 py-1 font-bold flex items-center rounded-md hover:border-dark-blue transition-colors cursor-pointer"
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
            <li className="flex -mx-4">
              <div className="px-4">
                <span className="flex items-center justify-center w-16 h-16 mx-auto text-2xl font-bold text-blue-600 rounded-full font-heading bg-blue-50">
                  1
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">Register</h3>
                <p className="leading-loose text-dark-border-gray-2">
                  Create an account with your e-mail to access the terminal
                  interface, we won't spam you.
                </p>
              </div>
            </li>
            <li className="flex -mx-4">
              <div className="px-4">
                <span className="flex items-center justify-center w-16 h-16 mx-auto text-2xl font-bold text-blue-600 rounded-full font-heading bg-blue-50">
                  2
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">
                  Connect to your exchange
                </h3>
                <p className="leading-loose text-dark-border-gray-2">
                  Funds are SAFU, we do not store API keys on our servers,
                  everything is stored in your browser.
                </p>
              </div>
            </li>
            <li className="flex -mx-4">
              <div className="px-4">
                <span className="flex items-center justify-center w-16 h-16 mx-auto text-2xl font-bold text-blue-600 rounded-full font-heading bg-blue-50">
                  3
                </span>
              </div>
              <div className="px-4">
                <h3 className="my-4 text-xl font-semibold">Start trading</h3>
                <p className="leading-loose text-dark-border-gray-2">
                  You are now ready to place your first trade with tuleep.trade,
                  we wish you good luck and all the best on the markets!
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

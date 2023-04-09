import React from 'react';
import { CgArrowRight } from 'react-icons/cg';

import { useSignIn } from '../../hooks/use-signin.hooks';

import { ContactComponent } from './contact.component';
import { FAQComponent } from './faq.component';
import { HomeHeroComponent } from './hero.component';
import { HowItWorksComponent } from './how-it-works.component';

export const HomeComponent = () => {
  const signIn = useSignIn();

  return (
    <div className="min-w-screen min-h-screen relative">
      <div className="w-full py-4 sm:px-8 sm:py-8">
        <div className="max-w-5xl mx-auto block sm:flex items-center">
          <h1 className="text-center mb-4 sm:mb-0 sm:text-left font-bold tracking-widest text-2xl text-dark-text-white">
            <img
              src="/public/tulip.png"
              alt="tulip"
              className="mr-2 inline w-[30px]"
            />
            <span>tuleep.trade</span>
          </h1>
          <div className="ml-auto flex items-center justify-center font-semibold">
            <a
              href="https://docs.tuleep.trade"
              className="cursor-pointer mr-4 sm:mr-4 border-2 px-4 py-1.5 rounded-lg border-dark-border-gray-2 hover:border-dark-text-white transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
            <div
              className="flex items-center group cursor-pointer rounded-lg bg-gradient-to-r from-purple-500/50 via-red-500/50 to-yellow-500/50 p-[2px] transition-colors hover:from-purple-500 hover:via-red-500 hover:to-yellow-500"
              onClick={signIn('home__navbar')}
            >
              <div className="rounded-md">
                <div className="flex h-full w-full items-center justify-center bg-dark-bg rounded-md px-4 py-1.5">
                  <span>Start trading</span>
                  <CgArrowRight className="translate-x-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeHeroComponent />
      <div className="w-full max-w-[90%] sm:max-w-3xl mx-auto bg-dark-border-gray my-12 sm:my-24 h-[2px]" />
      <div className="w-screen overflow-hidden sm:overflow-auto">
        <HowItWorksComponent />
      </div>
      <div className="w-full max-w-[90%] sm:max-w-3xl mx-auto bg-dark-border-gray my-12 sm:my-24 h-[2px]" />
      <div className="w-screen overflow-hidden sm:overflow-auto">
        <FAQComponent />
      </div>
      <div className="border-t-2 border-dark-border-gray-2 mt-6 py-6">
        <div className="max-w-5xl mx-auto flex px-4 sm:px-0">
          <div className="max-w-[300px]">
            <h1 className="text-center sm:text-left font-bold tracking-widest text-xl text-dark-text-white">
              <img
                src="/public/tulip.png"
                alt="tulip"
                className="mr-2 inline w-[24px]"
              />
              <span>tuleep.trade</span>
            </h1>
          </div>
          <ContactComponent />
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-w-screen relative min-h-screen">
      <div className="w-full py-4 sm:px-8 sm:py-8">
        <div className="mx-auto block max-w-5xl items-center sm:flex">
          <h1 className="text-dark-text-white mb-4 text-center text-2xl font-bold tracking-widest sm:mb-0 sm:text-left">
            <img src="/public/tulip.png" alt="tulip" className="mr-2 inline w-[30px]" />
            <span>tuleep.trade</span>
          </h1>
          <div className="ml-auto flex items-center justify-center font-semibold">
            <a
              href="https://docs.tuleep.trade"
              className="border-dark-border-gray-2 hover:border-dark-text-white mr-4 cursor-pointer rounded-lg border-2 px-4 py-1.5 transition-colors sm:mr-4"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
            <div
              className="group flex cursor-pointer items-center rounded-lg bg-gradient-to-r from-purple-500/50 via-red-500/50 to-yellow-500/50 p-[2px] transition-colors hover:from-purple-500 hover:via-red-500 hover:to-yellow-500"
              onClick={signIn('home__navbar')}
            >
              <div className="rounded-md">
                <div className="bg-dark-bg flex h-full w-full items-center justify-center rounded-md px-4 py-1.5">
                  <span>Start trading</span>
                  <CgArrowRight className="translate-x-1 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeHeroComponent />
      <div className="bg-dark-border-gray mx-auto my-12 h-[2px] w-full max-w-[90%] sm:my-24 sm:max-w-3xl" />
      <div className="w-screen overflow-hidden sm:overflow-auto">
        <HowItWorksComponent />
      </div>
      <div className="bg-dark-border-gray mx-auto my-12 h-[2px] w-full max-w-[90%] sm:my-24 sm:max-w-3xl" />
      <div className="w-screen overflow-hidden sm:overflow-auto">
        <FAQComponent />
      </div>
      <div className="border-dark-border-gray-2 mt-6 border-t-2 py-6">
        <div className="mx-auto flex max-w-5xl px-4 sm:px-0">
          <div className="max-w-[300px]">
            <h1 className="text-dark-text-white text-center text-xl font-bold tracking-widest sm:text-left">
              <img src="/public/tulip.png" alt="tulip" className="mr-2 inline w-[24px]" />
              <span>tuleep.trade</span>
            </h1>
          </div>
          <ContactComponent />
        </div>
      </div>
    </div>
  );
};

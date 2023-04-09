import React from 'react';
import { FaTwitter, FaDiscord, FaMedium } from 'react-icons/fa';

export const ContactComponent = () => {
  return (
    <div className="ml-auto flex items-center">
      <a
        href="https://twitter.com/tuleep_trade"
        target="_blank"
        rel="noreferrer"
        className="mr-2"
      >
        <span className="flex items-center justify-center bg-white rounded-md cursor-pointer w-8 h-8">
          <FaTwitter className="text-xl text-dark-bg" />
        </span>
      </a>
      <a
        href="https://blog.tuleep.trade"
        target="_blank"
        rel="noreferrer"
        className="mr-2"
      >
        <span className="flex items-center justify-center bg-white rounded-md cursor-pointer w-8 h-8">
          <FaMedium className="text-xl text-dark-bg" />
        </span>
      </a>
      <a href="https://discord.gg/j2txjpXMdm" target="_blank" rel="noreferrer">
        <span className="flex items-center justify-center bg-white rounded-md cursor-pointer w-8 h-8">
          <FaDiscord className="text-xl text-dark-bg" />
        </span>
      </a>
    </div>
  );
};

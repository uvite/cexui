import React from 'react';

export const FAQComponent = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-0">
      <div className="text-dark-border-gray-2">
        <div className="flex flex-wrap">
          <div className="mb-8 w-full px-4">
            <h4 className="mb-2 text-xl font-semibold md:mb-4">Why BETA?</h4>
            <div className="text-blueGray-500 text-sm leading-loose md:text-base">
              <>
                This project was created{' '}
                <a
                  className="text-blueLine underline"
                  href="https://twitter.com/iam4x/status/1575770044323495938"
                  target="_blank"
                  rel="noreferrer"
                >
                  within a week
                </a>
                .<br />
                And we wanted to make it live the fastest possible in order to start building with
                users needs as priority.
                <br />
                We are in continous development, you can ask for features and report bugs on our{' '}
                <a
                  href="https://discord.gg/j2txjpXMdm"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  discord
                </a>
                .
              </>
            </div>
          </div>
        </div>
        <div className="mt-20 w-full px-4">
          <h4 className="mb-2 text-xl font-semibold md:mb-4">DYOR</h4>
          <div className="text-blueGray-500 text-sm leading-loose">
            This terminal is using price information from your exchange APIs.
            <br />
            Therefore all information that is displayed on the website should be used with caution.
            We are not responsible of the data displayed.
            <br />
            <br />
            Please always do your own research and only invest what you can afford to lose.
            <br />
            Under no circumstances will we take responsibility for any pricing, display, or
            calculation errors whatsoever.
            <br />
            <br />
            The material presented here should not be taken as the basis for making investment
            decisions, nor be construed as a recommendation to engage in investment transactions.
            <br />
            Trading digital assets involve significant risk and can result in the total loss of your
            invested capital.
            <br />
            <br />
            You should ensure that you fully understand the risk involved and take into
            consideration your level of experience, investment objectives, and seek independent
            financial advice if necessary.
          </div>
        </div>
      </div>
    </div>
  );
};

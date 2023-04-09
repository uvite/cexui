import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html class="dark">
      <Head />
      <body class="bg-dark-bg text-dark-text-white max-w-screen overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

import { Howl } from 'howler';

export const playNewsAlertSound = () => {
  const sound = new Howl({
    src: ['/sounds/news-alert.mp3'],
    preload: true,
    format: 'mp3',
  });
  sound.play();
};

export const playOrderFilledSound = () => {
  const sound = new Howl({
    src: ['/sounds/order-filled.mp3'],
    preload: true,
    format: 'mp3',
  });
  sound.play();
};

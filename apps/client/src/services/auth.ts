import type { AuthProvider } from '@seaborn/shared/root';

const popupCenter = (url: string, title: string, w: number, h: number) => {
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `,
  );

  newWindow?.focus();
  return newWindow;
};

const providerAuth = async (provider: AuthProvider) => {
  const authpopup = popupCenter(
    `${import.meta.env.VITE_SERVER_URL}/oauth/${provider}/login`,
    `${provider} Login`,
    500,
    600,
  );

  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (authpopup?.closed) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
};

export default { providerAuth };

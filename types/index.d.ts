export type ArrayOrObject = [] | Record<string, any>;

declare global {
  interface Window {
    analytics?: {
      page: () => void;
      identify: (...args) => void;
      track: (...args) => void;
    };
  }
}

export type FooterElements = {
  left?: ReactElement | string;
  center?: ReactElement | string;
  right?: ReactElement | string;
}

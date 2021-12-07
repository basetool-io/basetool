export type ArrayOrObject = [] | Record<string, any>;

declare global {
  interface Window {
    analytics?: {
      page: () => void;
      identify: (...args) => void;
      track: (...args) => void;
    };
    FS?: any;
  }
}

export type FooterElements = {
  left?: ReactElement | string;
  center?: ReactElement | string;
  right?: ReactElement | string;
}

export type GenericEvent = {
  currentTarget: {
    value: string
  };
}


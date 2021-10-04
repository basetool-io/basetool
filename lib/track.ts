import isUndefined from "lodash/isUndefined"

export const segment = () => {
  if (!isUndefined(window) && window?.analytics) {
    return window?.analytics;
  }

  return {
    page: () => undefined,
    identify: (...args: any) => undefined,
    track: (...args: any) => undefined,
  };
};

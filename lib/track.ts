import isUndefined from "lodash/isUndefined"

export const segment = () => {
  if (!isUndefined(window) && window?.analytics) {
    return window?.analytics;
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    page() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    identify() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    track() {},
  };
};

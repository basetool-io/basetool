import Analytics from "analytics-node";
import isUndefined from "lodash/isUndefined";

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

export const serverSegment = () => {
  return new Analytics(process.env.NEXT_PUBLIC_SEGMENT_PUBLIC_KEY as string);
};

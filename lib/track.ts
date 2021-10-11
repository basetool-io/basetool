import { inProduction } from "./environment";
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
  let segment: any;

  if (inProduction) {
    segment = new Analytics(
      process.env.NEXT_PUBLIC_SEGMENT_PUBLIC_KEY as string
    );
  } else {
    segment = {
      track: (...args: any) => undefined,
    };
  }

  return {
    track: (...args: any) => {
      try {
        segment.track(...args as any);
      } catch (error) {}
    },
  };
};

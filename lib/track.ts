import { segmentWriteKey } from "./services";
import Analytics from "analytics-node";
import isUndefined from "lodash/isUndefined";

export const segment = () => {
  if (!isUndefined(window) && window?.analytics) {
    return window?.analytics;
  }

  return {
    page: () => undefined,
    identify: () => undefined,
    track: () => undefined,
  };
};

export const serverSegment = () => {
  let segment: any;

  if (true) {
    segment = new Analytics(segmentWriteKey as string);
  } else {
    segment = {
      track: () => undefined,
    };
  }

  return {
    track: (args: any) => {
      try {
        if (args?.userId && args?.email) {
          segment.identify({
            userId: args.userId,
            traits: { email: args.email },
          });
        }
        segment.track(args);
      } catch (error) {
        console.log(error);
      }
    },
  };
};

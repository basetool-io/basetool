import { inProduction } from "./environment";
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

export const serverSegment = (identification?: {
  userId?: number;
  email?: string;
}) => {
  let segment: any;

  if (inProduction) {
    segment = new Analytics(segmentWriteKey as string);
    if (identification) segment.identify({ traits: identification });
  } else {
    segment = {
      track: () => undefined,
    };
  }

  return {
    track: (...args: any) => {
      try {
        segment.track({ userId: identification?.userId, ...(args as any) });
      } catch (error) {}
    },
  };
};

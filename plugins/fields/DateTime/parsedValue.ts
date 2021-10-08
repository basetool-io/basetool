import { DateTime } from "luxon";
import isNull from "lodash/isNull";

export const parsed = (value: unknown): DateTime => {
  let parsed = DateTime.fromISO(value as string);

  // If the format is not ISO, try timestamp
  if (!isNull(value) && !parsed.isValid) {
    try {
      parsed = DateTime.fromSeconds(value as number);
    } catch (error) {}
  }

  return parsed;
};

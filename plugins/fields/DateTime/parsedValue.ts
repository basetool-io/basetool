import { DateTime } from "luxon"

export const parsed = (value: unknown): DateTime => {
  let parsed = DateTime.fromISO(value as string)

  // If the format is not ISO, try timestamp
  if (!parsed.isValid) {
    parsed = DateTime.fromSeconds(value as number)
  }

  return parsed
}

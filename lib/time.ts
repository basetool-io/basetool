import { DateTimeFieldOptions } from "@/plugins/fields/DateTime/types";

export const getBrowserTimezone = () =>
  window ? window.Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
export const getFormatFormFieldOptions = (
  fieldOptions: DateTimeFieldOptions
): string => {
  if (fieldOptions.showDate) {
    if (fieldOptions.showTime) {
      return dateTimeFormat;
    } else {
      return dateFormat;
    }
  } else if (fieldOptions.showTime) {
    return timeFormat;
  } else {
    // Fallback to dateTime
    return dateTimeFormat;
  }
};
export const timeFormat = "HH:mm:ss";
export const dateFormat = "dd/LL/yyyy";
export const dateTimeFormat = "dd/LL/yyyy HH:mm:ss";

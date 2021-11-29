import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { SerializedError } from "@reduxjs/toolkit";
import { isString, trim } from "lodash";

export const randomString = (length = 12) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * Convert string keys to objects:
 * ex { 'baseOptions.label': 'hey' } -> { baseOptions: { label: 'hey' }}
 */
export const dotNotationToObject = (payload: Record<string, unknown>) => {
  let namespace: "baseOptions" | "fieldOptions" | undefined;
  let result: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    const segments = key.split(".");
    if (segments && segments.length === 2) {
      namespace = segments[0] as "baseOptions" | "fieldOptions";
      key = segments[1];
    }

    if (namespace) {
      result[namespace] ||= {};
      result[namespace] = {
        ...(result[namespace] as Record<string, unknown>),
        [key]: value,
      };
    } else {
      result = {
        [key]: value,
      };
    }
  });

  return result;
};

export const extractMessageFromRTKError = (
  error: FetchBaseQueryError | SerializedError | undefined
) => {
  if (!error) return;

  if ("data" in error) return (error as any)?.data?.messages[0];
  if ("message" in error) return error?.message;
};

export const trimValues = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      isString(value) ? trim(value) : value,
    ])
  );
};

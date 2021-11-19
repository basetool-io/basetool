import { PaginationType } from "../types";

export const defaultSettings: {
  readOnly: boolean;
  pagination: PaginationType;
  supports: {
    filters: boolean;
    columnsRequest: boolean;
  };
  runsInProxy: boolean;
} = {
  readOnly: false,
  pagination: "offset",
  supports: {
    filters: true,
    columnsRequest: true,
  },
  runsInProxy: true,
};

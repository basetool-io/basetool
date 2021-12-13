import { IFilter } from "../tables/types";
import { isArray, isString } from "lodash";

export const filtersForHasMany = (
  columnName: string,
  ids: string | number[]
): IFilter[] => {
  let value = "";

  if (isArray(ids)) {
    value = ids.join(",");
  } else if (isString(ids)) {
    value = ids;
  }

  return [
    {
      column: {},
      columnName,
      condition: "is_in",
      value,
      verb: "and",
    },
  ];
};


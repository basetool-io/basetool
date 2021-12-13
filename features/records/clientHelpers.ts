import { Column } from "../fields/types"
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
      column: {} as Column,
      columnName,
      condition: "is_in",
      value,
      verb: "and",
    },
  ];
};

import { FilterOrFilterGroup } from "../tables/types";
import { isArray, isNull } from "lodash";

export const convertToBaseFilters = (
  filters: FilterOrFilterGroup[] | null | undefined
): FilterOrFilterGroup[] => {
  if (!filters || isNull(filters) || !isArray(filters)) return [];

  return filters.map((filter: FilterOrFilterGroup) => ({
    ...filter,
    isBase: true,
  }));
};

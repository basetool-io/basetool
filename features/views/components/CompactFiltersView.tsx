import { IFilter, IFilterGroup } from "@/features/tables/types";
import { isEmpty } from "lodash";
import { memo } from "react";

const CompactFiltersView = ({
  filters,
}: {
  filters: Array<IFilter | IFilterGroup>;
}) => {
  return (
    <div className="space-y-1">
      {isEmpty(filters) && (
        <div className="text-sm text-gray-600">
          No base filters applied to this view
        </div>
      )}

      {isEmpty(filters) ||
        filters.map((filter, idx) => {
          if ("isGroup" in filter && filter.isGroup) {
            return (
              <div key={idx} className="text-gray-600">
                <span>{filter.verb}</span>
                <div className="bg-gray-200 rounded">
                  {filter.filters.map((filter: any, i: number) => {
                    return (
                      <div className="px-1">
                        {idx === 0 || i === 0 ? "" : filter.verb}{" "}
                        <div>
                          <span className="font-bold">
                            {filter.column.label}
                          </span>{" "}
                          {filter.condition.replaceAll("_", " ")}{" "}
                          <span className="font-bold">
                            {filter.value
                              ? filter.value
                              : filter.option
                              ? filter.option.replaceAll("_", " ")
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="text-gray-600">
                <div>
                  <span>{idx === 0 ? "" : filter.verb}</span>
                </div>
                <span className="font-bold">
                  {(filter as IFilter).column.label}
                </span>{" "}
                {(filter as IFilter).condition.replaceAll("_", " ")}{" "}
                <span className="font-bold">
                  {(filter as IFilter).value
                    ? (filter as IFilter).value
                    : (filter as IFilter)?.option
                    ? (filter as any).option.replaceAll("_", " ")
                    : ""}
                </span>
              </div>
            );
          }
        })}
    </div>
  );
};

export default memo(CompactFiltersView);

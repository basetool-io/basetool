import { IFilter, IFilterGroup } from "@/features/tables/types";
import { ReactNode, memo } from "react";
import { isEmpty } from "lodash";

const SIZE_CONDITIONS = {
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
};

const Verb = ({ children }: { children: ReactNode | string }) => {
  return (
    <div className="my-1 text-xs text-gray-600 font-bold uppercase leading-none">
      {children}
    </div>
  );
};

const FilterRow = ({
  columnName,
  condition,
  value,
}: {
  columnName: string;
  condition: string;
  value: string;
}) => {
  const prettyCondition: any = Object.keys(SIZE_CONDITIONS).includes(condition)
    ? (SIZE_CONDITIONS as any)[condition]
    : condition;

  return (
    <div>
      <span className="font-semibold">{columnName}</span> {prettyCondition}{" "}
      <span className="font-semibold">{value}</span>{" "}
    </div>
  );
};

const CompactFiltersView = ({
  filters,
}: {
  filters: Array<IFilter | IFilterGroup>;
}) => {
  if (isEmpty(filters))
    return (
      <div className="text-sm text-gray-600">
        No base filters applied to this view
      </div>
    );

  return (
    <>
      {filters.map((filter, idx) => {
        if ("isGroup" in filter) {
          return (
            <div key={idx}>
              {idx === 0 ? "" : <Verb>{filter.verb}</Verb>}
              <div className="bg-gray-200 rounded px-1 -mx-1">
                <CompactFiltersView filters={filter.filters} />
              </div>
            </div>
          );
        } else {
          const filterValue =
            filter?.value || filter?.option?.replaceAll("_", " ") || "";

          return (
            <div key={idx}>
              {idx === 0 ? "" : <Verb>{filter.verb}</Verb>}
              <FilterRow
                columnName={filter.column.label}
                condition={filter.condition.replaceAll("_", " ")}
                value={filterValue}
              />
            </div>
          );
        }
      })}
    </>
  );
};

export default memo(CompactFiltersView);

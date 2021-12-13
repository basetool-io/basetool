import { Field } from "../../types";
import { ReactNode, memo, useMemo } from "react";
import { getColumnNameLabel, iconForField } from "../..";
import { isEmpty, isNull, isUndefined } from "lodash";
import { useResponsive } from "@/hooks";
import classNames from "classnames";

const ShowFieldWrapper = ({
  field,
  children,
  extra,
  inline = false,
}: {
  field: Field<any>;
  children: ReactNode;
  extra?: ReactNode;
  inline?: boolean;
}) => {
  const prettyColumnName = getColumnNameLabel(
    field?.column?.baseOptions?.label,
    field?.column?.label,
    field?.column?.name
  );

  const IconElement = useMemo(
    () => iconForField(field.column),
    [field.column.fieldType]
  );

  const { isMd } = useResponsive();
  const showExtra = useMemo(() => {
    if (isMd) {
      return !isEmpty(extra);
    } else {
      return !isUndefined(extra) && !isNull(extra) && !isEmpty(extra);
    }
  }, [isMd, extra]);

  return (
    <div
      className={classNames("flex flex-col border-b text-sm py-3 md:py-0", {
        "md:flex-col": inline,
        "md:flex-row md:min-h-14 space-y-3 md:space-y-0": !inline,
      })}
    >
      <div
        className={classNames("w-full flex items-start px-4 space-x-2", {
          "md:w-48 lg:w-64 xl:w-64 md:px-6": !inline,
        })}
      >
        <div
          className={classNames("flex items-center space-x-2 md:min-h-14", {
            "pb-3 md:pb-0 md:pt-3": inline,
            "md:py-3": !inline,
          })}
        >
          <IconElement className="h-4 self-start mt-1 lg:self-center lg:mt-0 inline-block flex-shrink-0 text-gray-500" />{" "}
          <span>{prettyColumnName}</span>
        </div>
      </div>
      <div className="flex-2 xl:flex-1 flex flex-row">
        <div className="w-full px-4 md:py-3 self-center">{children}</div>
      </div>
      {showExtra && <div className="flex-1 py-3">{extra}</div>}
    </div>
  );
};

export default memo(ShowFieldWrapper);

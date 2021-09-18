import { Field } from "../../types";
import { ReactNode, useMemo } from "react";
import { humanize } from "@/lib/humanize";
import { iconForField } from "../..";

const ShowFieldWrapper = ({
  field,
  children,
  extra,
}: {
  field: Field;
  children: ReactNode;
  extra?: ReactNode;
}) => {
  const prettyColumnName = useMemo(
    () => (field?.column?.name ? humanize(field.column.name) : ""),
    [field?.column?.name]
  );
  const IconElement = useMemo(
    () => iconForField(field.column),
    [field.column.fieldType]
  );

  return (
    <div className="flex border-b min-h-16">
      <div className="w-48 md:w-64 px-6 flex items-start space-x-2">
        <div className="flex items-center space-x-2 min-h-16 py-4">
          <IconElement className="h-4 inline-block flex-shrink-0" />{" "}
          <span>{prettyColumnName}</span>
        </div>
      </div>
      <div className="flex-1 flex flex-row">
        <div className="p-4 self-center">{children}</div>
      </div>
      <div className="flex-1 py-4">{extra}</div>
    </div>
  );
};

export default ShowFieldWrapper;

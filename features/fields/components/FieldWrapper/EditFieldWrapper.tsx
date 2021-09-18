import { AnySchema } from "joi";
import { Field } from "../../types";
import { fieldId, iconForField } from "../..";
import { humanize } from "@/lib/humanize";
import React, { ReactNode, useMemo } from "react";

const EditFieldWrapper = ({
  field,
  children,
  extra,
  schema,
}: {
  field: Field;
  children: ReactNode;
  extra?: ReactNode;
  schema?: AnySchema;
}) => {
  const prettyColumnName = useMemo(
    () => (field?.column?.name ? humanize(field.column.name) : ""),
    [field?.column?.name]
  );
  const IconElement = useMemo(
    () => iconForField(field.column),
    [field.column.fieldType]
  );
  const isRequired = useMemo(
    () => (schema ? schema?.$_getFlag("presence") === "required" : false),
    [schema]
  );

  return (
    <div className="flex items-start leading-tight border-b min-h-16">
      <label
        className="w-48 md:w-64 px-6 flex items-start space-x-2 font-normal min-h-16"
        htmlFor={fieldId(field)}
      >
        <div className="flex items-center space-x-2 min-h-16 py-4">
          <IconElement className="h-4 inline-block flex-shrink-0" />{" "}
          <span>{prettyColumnName}</span>
          {isRequired && <sup className="text-red-600">*</sup>}
        </div>
      </label>
      <div className="flex-1 flex items-center min-h-16 py-3">
        <div className="self-center">{children}</div>
      </div>
      <div className="flex-1 py-4">{extra}</div>
    </div>
  );
};

export default EditFieldWrapper;

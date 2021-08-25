import { AnySchema } from "joi";
import { Field } from "../../types";
import { FormLabel } from "@chakra-ui/react";
import classNames from "classnames";
import { fieldId, iconForField } from "../..";
import React, { ReactNode, useMemo } from "react";
import { humanize } from "@/lib/humanize";

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
    <div className={classNames("flex", "items-start", "py-1", "leading-tight")}>
      <FormLabel
        className="w-48 md:w-64 py-2 px-6 h-full flex space-x-2"
        htmlFor={fieldId(field)}
      >
        <IconElement className="h-4 inline-block" />{" "}
        <span>{prettyColumnName}</span>
        {isRequired && <sup className="text-red-600">*</sup>}
      </FormLabel>
      <div className="flex-1 flex flex-row">
        <div className="p-3 self-center">{children}</div>
      </div>
      <div className="flex-1 py-4">{extra}</div>
    </div>
  );
};

export default EditFieldWrapper;

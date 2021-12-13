import {
  Code,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Select,
} from "@chakra-ui/react";
import { EditFieldProps } from "@/features/fields/types";
import { getPrettyName } from "@/features/records/clientHelpers"
import { humanize } from "@/lib/humanize";
import { isEmpty, isFunction, isNull } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useGetRecordsQuery } from "@/features/records/api-slice";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import Link from "next/link";
import React, { memo, useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import parse from "html-react-parser";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  schema,
  setValue,
  view,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const { name } = register;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = field?.column?.baseOptions?.help
    ? field.column.baseOptions.help
    : null;
  const hasHelp = !isNull(helpText);

  // options
  const placeholder = field?.column?.baseOptions?.placeholder
    ? field.column.baseOptions.placeholder
    : "";
  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;
  const defaultValue =
    field?.column?.baseOptions?.defaultValue && view === "new"
      ? field.column.baseOptions.defaultValue
      : null;

  // Get all the options
  const { dataSourceId, tableName } = useDataSourceContext();
  const foreignTableName = field?.column?.foreignKeyInfo?.foreignTableName;

  const { data: recordsResponse, isLoading } = useGetRecordsQuery(
    {
      dataSourceId,
      tableName: foreignTableName,
    },
    { skip: !dataSourceId || !foreignTableName }
  );

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError} isDisabled={readonly}>
        {/* @todo: use regular text inoput when failed to fetch all the records for the association */}
        {isLoading && <Shimmer width={"100%"} height={33} />}
        {isLoading || (
          <Select
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register}
            onChange={(e) =>
              isFunction(setValue) &&
              setValue(register.name, e.currentTarget.value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            size="sm"
          >
            {recordsResponse?.ok &&
              recordsResponse?.data.map((record: Record<string, any>) => (
                <option key={record.id} value={record.id}>
                  {getPrettyName(
                    record,
                    field.column?.fieldOptions?.nameColumn as string
                  )}
                </option>
              ))}
          </Select>
        )}
        {isEmpty(field.column.fieldOptions.nameColumn) && (
          <FormHelperText>
            You can change the label from id to something more meaningful like{" "}
            {humanize(field.column.name)} <Code>name</Code> or{" "}
            <Code>title</Code>{" "}
            <Link
              href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${field.column.name}`}
            >
              <a className="text-blue-600 cursor-pointer">here</a>
            </Link>
            .
          </FormHelperText>
        )}
        {hasHelp && <FormHelperText>{parse(helpText || "")}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Select,
} from "@chakra-ui/react";
import { isEmpty, isFunction, isNull } from "lodash";
import { useForeignName } from "./hooks";
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import parse from "html-react-parser";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  schema,
  setValue,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const { errors } = formState;
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

  // Get all the options
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = field?.column?.foreignKeyInfo?.foreignTableName;
  const getForeignName = useForeignName(field);

  const { data: recordsResponse, isLoading } = useGetRecordsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl
        isInvalid={hasError && formState.isDirty}
        isDisabled={readonly}
      >
        {/* @todo: use regular text inoput when failed to fetch all the records for the association */}
        {isLoading && <Shimmer width={120} />}
        {isLoading || (
          <Select
            placeholder={placeholder}
            {...register}
            onChange={(e) =>
              isFunction(setValue) &&
              setValue(register.name, e.currentTarget.value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          >
            {recordsResponse?.ok &&
              recordsResponse?.data.map((record: Record<string, any>) => (
                <option key={record.id} value={record.id}>
                  {getForeignName(record)}
                </option>
              ))}
          </Select>
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

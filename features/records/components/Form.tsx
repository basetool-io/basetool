import { Button, ButtonGroup } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { PencilAltIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { Views } from "@/features/fields/enums";
import { diff as difference } from "deep-object-diff";
import { getField } from "@/features/fields/factory";
import { isFunction } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi";
import { makeField } from "@/features/fields";
import { toast } from "react-toastify";
import { useBoolean } from "react-use";
import {
  useCreateRecordMutation,
  useUpdateRecordMutation,
} from "@/features/records/api-slice";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import ApiResponse from "@/features/api/ApiResponse";
import BackButton from "./BackButton";
import Joi, { ObjectSchema } from "joi";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import isUndefined from "lodash/isUndefined";
import logger from "@/lib/logger";
import type { Record } from "@/features/records/types";

const makeSchema = async (record: Record, columns: Column[]) => {
  const schema: { [columnName: string]: any } = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const column of columns) {
    let fieldSchema;

    try {
      // eslint-disable-next-line no-await-in-loop
      fieldSchema = (
        await import(`@/plugins/fields/${column.fieldType}/schema`)
      ).default;
    } catch (error: any) {
      if (error.code !== "MODULE_NOT_FOUND")
        logger.warn("Error importing field schema->", error);
      fieldSchema = Joi.any();
    }
    if (isFunction(fieldSchema)) {
      schema[column.name] = fieldSchema(record, column);
    } else if (!isUndefined(fieldSchema)) {
      schema[column.name] = fieldSchema;
    }
  }

  return Joi.object(schema);
};

// @todo: we should initialize the empty record based on the default values
const Form = ({
  record,
  columns,
  formForCreate = false,
}: {
  record: Record;
  columns: Column[];
  formForCreate?: boolean;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useBoolean(false);
  const [schema, setSchema] = useState<ObjectSchema>(Joi.object());

  const setTheSchema = async () => {
    setSchema(await makeSchema(record, columns));
  };

  useEffect(() => {
    setTheSchema();
  }, [record, columns]);

  const { register, handleSubmit, formState, setValue, getValues, watch } =
    useForm({
      mode: "onTouched",
      defaultValues: record,
      resolver: joiResolver(schema),
    });

  const formData = watch();

  const diff = difference(record, formData);

  const backLink = useMemo(() => {
    if (router.query.fromTable) {
      if (router.query.fromRecord) {
        return `/data-sources/${router.query.dataSourceId}/tables/${router.query.fromTable}/${router.query.fromRecord}`;
      } else {
        return `/data-sources/${router.query.dataSourceId}/tables/${router.query.fromTable}`;
      }
    }

    if (formForCreate) {
      return `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`;
    } else {
      return `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${router.query.recordId}`;
    }
  }, [router.query]);

  const [createRecord, { isLoading: isCreating }] = useCreateRecordMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateRecordMutation();

  const onSubmit = async (formData: any) => {
    let response;

    setIsLoading(true);
    try {
      if (formForCreate) {
        response = await createRecord({
          dataSourceId: router.query.dataSourceId as string,
          tableName: router.query.tableName as string,
          body: {
            record: formData,
          },
        });

        setIsLoading(false);

        if (response && "data" in response) {
          const apiResponse: ApiResponse = response.data;

          const { data } = apiResponse;
          const { id } = data;
          if (apiResponse.ok) {
            router.push(
              `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${id}`
            );
          }
        }
      } else if (
        router.query.dataSourceId &&
        router.query.tableName &&
        record.id
      ) {
        const response = await updateRecord({
          dataSourceId: router.query.dataSourceId as string,
          tableName: router.query.tableName as string,
          recordId: record.id.toString(),
          body: {
            changes: Object.fromEntries(Object.entries(diff).map(([key]) => [key, getValues(key)])),
          },
        });
        router.push(backLink);
      } else {
        toast.error("Not enough data.");
      }
    } catch (error) {
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  return (
    <>
      <PageWrapper
        icon={<PencilAltIcon className="inline h-5 text-gray-500" />}
        heading={formForCreate ? "Create record" : "Edit record"}
        flush={true}
        buttons={
          <>
            <ButtonGroup size="sm">
              <BackButton href={backLink} />
              <Button
                colorScheme="blue"
                isLoading={isLoading}
                onClick={() => {
                  handleSubmit(onSubmit)();
                }}
              >
                <Save className="h-4" /> {formForCreate ? "Create" : "Save"}
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            {columns &&
              columns.map((column: Column) => {
                if (!formData) return null;

                const field = makeField({
                  record: formData as Record,
                  column,
                  tableName: router.query.tableName as string,
                });
                let schemaForColumn;
                try {
                  schemaForColumn = schema.extract(column.name);
                } catch (error) {}

                const Element = getField(column, Views.edit);

                return (
                  <Element
                    key={column.name}
                    field={field}
                    formState={formState}
                    register={register}
                    setValue={setValue}
                    schema={schemaForColumn}
                  />
                );
              })}
            {isCreating && <LoadingOverlay label="Creating..." />}
            {isUpdating && <LoadingOverlay label="Updating..." />}
            <input type="submit" value="Submit" className="hidden" />
          </form>
        </>
      </PageWrapper>

      {/* <pre>{JSON.stringify(diff, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(record, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(formState, null, 2)}</pre> */}
    </>
  );
};

export default Form;

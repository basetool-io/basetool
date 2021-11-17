import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { PencilAltIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { diff as difference } from "deep-object-diff";
import { getField } from "@/features/fields/factory";
import { isFunction } from "lodash";
import { joiResolver } from "@hookform/resolvers/joi/dist/joi";
import { makeField } from "@/features/fields";
import { toast } from "react-toastify";
import {
  useCreateRecordMutation,
  useUpdateRecordMutation,
} from "@/features/records/api-slice";
import { useDataSourceContext } from "@/hooks";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
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
  const { dataSourceId, tableName, recordId, tableIndexPath, recordsPath } =
    useDataSourceContext();
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

  const backLink = useMemo(
    () => (formForCreate ? tableIndexPath : `${recordsPath}/${recordId}`),
    [formForCreate, tableIndexPath, recordsPath, recordId]
  );

  const [createRecord, { isLoading: isCreating }] = useCreateRecordMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateRecordMutation();

  const onSubmit = async (formData: any) => {
    let response;

    // Send only touched fields to de-risk fields that alter the content on load (datetime fields)
    const touchedFields = Object.entries(formState.touchedFields)
      .filter(([name, touched]) => touched)
      .map(([name]) => name);

    try {
      if (formForCreate) {
        response = await createRecord({
          dataSourceId: dataSourceId,
          tableName: tableName,
          body: {
            record: Object.fromEntries(
              Object.entries(formData).filter(([name]) =>
                touchedFields.includes(name)
              )
            ),
          },
        }).unwrap();

        if (response && "data" in response) {
          const { data } = response;
          const { id } = data;
          if (response.ok) {
            await router.push(`${recordsPath}/${id}`);
          }
        }
      } else if (dataSourceId && tableName && record.id) {
        const changes = Object.fromEntries(
          Object.entries(diff)
            .filter(([name]) => touchedFields.includes(name))
            .map(([key]) => {
              // handle nullable and nullValues
              const column = columns.find((c) => c.name === key);
              if (
                column &&
                column.baseOptions.nullable === true &&
                Object.values(column.baseOptions.nullValues).includes(
                  getValues(key)
                )
              )
                return [key, null];

              return [key, getValues(key)];
            })
        );

        const response = await updateRecord({
          dataSourceId: dataSourceId,
          tableName: tableName,
          recordId: record.id.toString(),
          body: {
            changes,
          },
        }).unwrap();

        if (response?.ok) {
          return await router.push(backLink);
        }
      } else {
        toast.error("Not enough data.");
      }
    } catch (error: any) {
      toast.error(error?.data?.meta?.errorMessage, {
        // These error messages tend to be quite verbose
        // Add and offset to the left 320 pixels
        className: "!w-[640px] left-[-320px]",
      });
    }
  };

  const filteredColumns = useMemo(
    () => columns.filter((column) => column.baseOptions.computed !== true),
    [columns]
  );

  return (
    <>
      <PageWrapper
        icon={<PencilAltIcon className="inline h-5 text-gray-500" />}
        crumbs={[tableName, formForCreate ? "Create record" : "Edit record"]}
        flush={true}
        buttons={<BackButton href={backLink} />}
        footer={
          <PageWrapper.Footer
            center={
              <Button
                type="submit"
                colorScheme="blue"
                size="sm"
                width="300px"
                isLoading={isCreating || isUpdating}
                onClick={handleSubmit(onSubmit)}
              >
                <Save className="h-4" /> {formForCreate ? "Create" : "Save"}
              </Button>
            }
          />
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full h-full flex-1 flex flex-col justify-between">
            <div>
              {filteredColumns &&
                filteredColumns.map((column: Column) => {
                  if (!formData) return null;

                  const field = makeField({
                    record: formData as Record,
                    column,
                    tableName: tableName,
                  });
                  let schemaForColumn;
                  try {
                    schemaForColumn = schema.extract(column.name);
                  } catch (error) {}

                  const Element = getField(column, "edit");

                  return (
                    <Element
                      key={column.name}
                      field={field}
                      formState={formState}
                      register={register}
                      setValue={setValue}
                      schema={schemaForColumn}
                      view={formForCreate ? "new" : "edit"}
                    />
                  );
                })}
              {isCreating && <LoadingOverlay label="Creating..." />}
              {isUpdating && <LoadingOverlay label="Updating..." />}
              <input type="submit" value="Submit" className="hidden" />
            </div>
          </div>
        </form>
      </PageWrapper>
    </>
  );
};

export default Form;

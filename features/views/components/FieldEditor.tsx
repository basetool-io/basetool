import { Button, Code } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useDeleteColumnMutation } from "@/features/views/api-slice";
import { useUpdateColumn } from "../hooks";
import FieldTypeOption from "@/features/views/components/FieldTypeOption";
import GenericBooleanOption from "@/features/views/components/GenericBooleanOption";
import GenericTextOption from "@/features/views/components/GenericTextOption";
import NullableOption from "@/features/views/components/NullableOption";
import React, { useMemo } from "react";
import VisibilityOption from "@/features/views/components/VisibilityOption";
import dynamic from "next/dynamic";

const getDynamicInspector = (fieldType: string) => {
  try {
    return dynamic(
      () => {
        try {
          // return the Inspector component if found
          return import(`@/plugins/fields/${fieldType}/Inspector.tsx`);
        } catch (error) {
          // return empty component
          return Promise.resolve(() => null);
        }
      },
      {
        // eslint-disable-next-line react/display-name
        loading: ({ isLoading }: { isLoading?: boolean }) =>
          isLoading ? <div className="px-4">Loading...</div> : null,
      }
    );
  } catch (error) {
    return () => null;
  }
};

function FieldEditor() {
  const track = useSegment();
  const { column, setColumnOptions } = useUpdateColumn();
  const { viewId } = useDataSourceContext();

  const [deleteColumn] = useDeleteColumnMutation();

  const deleteField = async () => {
    if (!column) return;

    if (confirm("Are you sure you want to remove this virtual field?")) {
      track("Deleted computed field", {
        fieldType: column.fieldType,
        computed: column.baseOptions.computed,
      });

      await deleteColumn({
        viewId,
        columnName: column.name,
      });
    }
  };

  const InspectorComponent: any = useMemo(() => {
    if (!column) return (...rest: any) => "";

    return getDynamicInspector(column?.fieldType);
  }, [column?.fieldType]);

  const isComputed = useMemo(
    () => column?.baseOptions?.computed === true,
    [column]
  );

  if (!column) return null;

  const handleColumnOptionsChange = (
    columnName: string,
    payload: Record<string, unknown>
  ) => {
    track("Updated column option from inspector", {
      fieldType: column.fieldType,
      computed: column.baseOptions.computed,
    });
    setColumnOptions(columnName, payload);
  };

  return (
    <>
      <div className="block space-y-6 py-4 w-1/3 border-r">
        <FieldTypeOption />

        {isComputed && (
          <GenericTextOption
            label="Computed value"
            helpText="Value that has to be computed. You have to refresh the page after changing this value."
            optionKey="baseOptions.computedSource"
            placeholder="Label value"
            defaultValue={column?.baseOptions?.computedSource}
            className="font-mono"
            formHelperText={
              <>
                You can use <Code size="sm">record</Code> in your query.
              </>
            }
          />
        )}

        {/* Some fields have their own configurations. */}
        <InspectorComponent
          column={column}
          setColumnOptions={handleColumnOptionsChange}
        />

        {!isComputed && (
          <GenericBooleanOption
            label="Disconnect field"
            helpText={
              <>
                Some fields you don't want to show at all. By disconnecting the
                field it will be hidden from all views and{" "}
                <strong>all responses</strong>.
              </>
            }
            optionKey="baseOptions.disconnected"
            checkboxLabel="Disconnect field"
            isChecked={column.baseOptions.disconnected === true}
          />
        )}
        <GenericTextOption
          label="Label"
          helpText="We are trying to find a good human name for your DB column, but if you want to change it, you can do it here. The label is reflected on Index (table header), Show, Edit and Create views."
          optionKey="baseOptions.label"
          placeholder="Label value"
          defaultValue={column?.baseOptions?.label}
          formHelperText={
            <>
              Original name for this field is <Code>{column.name}</Code>.
            </>
          }
        />
        <GenericTextOption
          helpText={
            <>
              You may use any html and hex color. <br /> We provide very good
              defaults for the following colors <Code>blue</Code>,{" "}
              <Code>red</Code>, <Code>green</Code>, <Code>yellow</Code>,{" "}
              <Code>orange</Code>, <Code>pink</Code>, <Code>purple</Code> and{" "}
              <Code>gray</Code>.
            </>
          }
          label="Background color"
          optionKey="baseOptions.backgroundColor"
          placeholder="{{ value.toLowerCase().includes('ok') ? 'green' : 'yellow'}}"
          className="font-mono w-full"
          defaultValue={column?.baseOptions?.backgroundColor}
          formHelperText={
            <>
              You can use the <Code>value</Code> variable.
            </>
          }
        />

        <VisibilityOption />

        {isComputed && (
          <div className="flex justify-end px-2">
            <Button
              colorScheme="red"
              size="xs"
              variant="outline"
              onClick={deleteField}
              leftIcon={<TrashIcon className="h-4" />}
            >
              Remove field
            </Button>
          </div>
        )}

        {!isComputed && (
          <>
            <div className="!-mb-2">
              <div className="uppercase text-sm font-bold px-2 mt-4 mb-1">
                Form options
              </div>
              <hr className="mt-0 mb-2" />
            </div>{" "}
            {!["Id", "DateTime"].includes(column.fieldType) && (
              <GenericTextOption
                helpText="Default value for create view."
                label="Default value"
                optionKey="baseOptions.defaultValue"
                placeholder="Default value"
                defaultValue={column?.baseOptions?.defaultValue}
              />
            )}
            <GenericTextOption
              label="Placeholder"
              helpText="Whatever you pass in here will be a short hint that describes the expected value of this field."
              optionKey="baseOptions.placeholder"
              placeholder="Placeholder value"
              defaultValue={column?.baseOptions?.placeholder}
            />
            <GenericTextOption
              helpText="Does this field need to display some help text to your users? Write it here and they will see it."
              label="Help text"
              optionKey="baseOptions.help"
              placeholder="Help text value"
              defaultValue={column?.baseOptions?.help}
            />
            <GenericBooleanOption
              helpText="Should this field be required in forms?"
              label="Required"
              optionKey="baseOptions.required"
              checkboxLabel="Required"
              isChecked={column.baseOptions.required === true}
              isDisabled={
                column.baseOptions.nullable === true ||
                column.baseOptions.readonly === true
              }
            />
            <GenericBooleanOption
              label="Readonly"
              helpText="Should this field be readonly in forms?"
              optionKey="baseOptions.readonly"
              checkboxLabel="Readonly"
              isChecked={column.baseOptions.readonly === true}
              isDisabled={column.baseOptions.required === true}
            />
            <NullableOption />
          </>
        )}
      </div>
    </>
  );
}

export default FieldEditor;

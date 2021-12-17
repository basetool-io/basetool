import { Button, Code } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { WidgetOptions } from "../types";
import { useDataSourceContext } from "@/hooks";
import { useDeleteWidgetMutation } from "../api-slice";
import { useUpdateWidget } from "../hooks";
import GenericCodeOption from "./GenericCodeOption";
import GenericTextOption from "@/features/dashboards/components/GenericTextOption";
import React from "react";
import TinyLabel from "@/components/TinyLabel";

function WidgetEditor() {
  const { widget } = useUpdateWidget();
  const { dashboardId } = useDataSourceContext();

  const [deleteWidget, { isLoading: isDeletingWidget }] =
    useDeleteWidgetMutation();

  const removeWidget = async () => {
    if (!widget) return;

    if (confirm("Are you sure you want to remove this widget?")) {
      await deleteWidget({
        dashboardId,
        widgetId: widget.id.toString(),
      });
    }
  };

  if (!widget) return null;

  return (
    <>
      <div className="block space-y-6 py-4 w-1/3 border-r">
        <TinyLabel className="px-4">{widget?.type}</TinyLabel>
        <GenericTextOption
          helpText="The name of the widget"
          label="Name"
          placeholder="Widget Name"
          formHelperText="This has to be unique."
          size="sm"
          defaultValue={widget?.name}
          optionKey="name"
        />
        {widget?.type === "metric" && (
          <>
            <GenericCodeOption
              helpText="The query that has to be run to get the data"
              label="Query"
              placeholder="SELECT ..."
              formHelperText={
                <>
                  You should return the result using <Code>AS VALUE</Code>.
                </>
              }
              defaultValue={widget?.query}
              optionKey="query"
            />
            <GenericTextOption
              helpText="The text that will be displayed in the left of the value"
              label="Prefix"
              placeholder="per"
              size="sm"
              defaultValue={(widget?.options as WidgetOptions)?.prefix || ""}
              optionKey="options.prefix"
            />
            <GenericTextOption
              helpText="The text that will be displayed in the right of the value"
              label="Suffix"
              placeholder="$"
              size="sm"
              defaultValue={(widget?.options as WidgetOptions)?.suffix || ""}
              optionKey="options.suffix"
            />
          </>
        )}
        <div className="flex justify-end px-2">
          <Button
            isLoading={isDeletingWidget}
            colorScheme="red"
            size="xs"
            variant="outline"
            onClick={removeWidget}
            leftIcon={<TrashIcon className="h-4" />}
          >
            Remove widget
          </Button>
        </div>
      </div>
    </>
  );
}

export default WidgetEditor;

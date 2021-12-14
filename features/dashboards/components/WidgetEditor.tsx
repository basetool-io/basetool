import { Button, Code } from "@chakra-ui/react";
import { DashboardItemOptions } from "./DashboardItemView";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import { useDeleteDashboardItemMutation } from "../api-slice";
import { useUpdateWidget } from "../hooks";
import GenericTextOption from "@/features/dashboards/components/GenericTextOption";
import React from "react";

function WidgetEditor() {
  const { widget } = useUpdateWidget();
  const { dashboardId } = useDataSourceContext();

  const [deleteWidget, { isLoading: isDeletingWidget }] = useDeleteDashboardItemMutation();

  const removeWidget = async () => {
    if (!widget) return;

    if (confirm("Are you sure you want to remove this widget?")) {
      await deleteWidget({
        dashboardId,
        dashboardItemId: widget.id.toString(),
      });
    }
  };

  if (!widget) return null;

  return (
    <>
      <div className="block space-y-6 py-4 w-1/3 border-r">
        <GenericTextOption
          helpText="The name of the widget"
          label="Name"
          placeholder="Widget Name"
          formHelperText="This has to be unique."
          size="sm"
          defaultValue={widget?.name}
          optionKey="name"
        />
        <GenericTextOption
          helpText="The query that has to be run to get the data"
          label="Query"
          placeholder="SELECT ..."
          className="font-mono"
          formHelperText={
            <>
              You should format the result using{" "}
              <Code>
                AS VALUE
              </Code>
              .
            </>
          }
          size="sm"
          defaultValue={widget?.query}
          optionKey="query"
        />
        <GenericTextOption
          helpText="The text that will be displayed in the left of the value"
          label="Prefix"
          placeholder="per"
          size="sm"
          defaultValue={(widget?.options as DashboardItemOptions)?.prefix || ""}
          optionKey="options.prefix"
        />
        <GenericTextOption
          helpText="The text that will be displayed in the right of the value"
          label="Suffix"
          placeholder="$"
          size="sm"
          defaultValue={(widget?.options as DashboardItemOptions)?.suffix || ""}
          optionKey="options.suffix"
        />
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
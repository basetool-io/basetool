import { DataSource, Widget } from "@prisma/client";
import { WidgetValue } from "@/features/dashboards/types";
import { runQuery } from "@/plugins/data-sources/serverHelpers";

export const getValueForWidget = async (
  widget: Pick<Widget, "id" | "query" | "type">,
  dataSource: DataSource
) => {
  let response: WidgetValue;

  try {
    let queryValue = {
      value: "",
    };

    if (widget.type === "metric") {
      queryValue = await runQuery(dataSource, "runRawQuery", {
        query: widget.query,
      });
    }

    response = {
      id: widget.id,
      value: queryValue.value,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    response = {
      id: widget.id,
      error: e.message,
    };
  }

  return response;
};

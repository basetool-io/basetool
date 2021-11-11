import { activeColumnSelector } from "@/features/records/state-slice";
import { dotNotationToObject } from "@/lib/helpers";
import { getColumnOptions } from "@/features/fields";
import { useAppSelector } from "@/hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "../fields/api-slice";
import { useMemo } from "react";
import { useUpdateColumnMutation } from "@/features/views/api-slice";

export const useUpdateColumn = () => {
  const { viewId } = useDataSourceContext();
  const column = useAppSelector(activeColumnSelector);

  const [updateColumnOnServer] = useUpdateColumnMutation();

  const columnOptions = useMemo(() => {
    if (column) {
      return getColumnOptions(column);
    } else {
      return [];
    }
  }, [column]);

  const setColumnOptions = (
    columnName: string,
    payload: Record<string, unknown>
  ) => {
    const body = dotNotationToObject(payload);

    updateColumnOnServer({
      viewId,
      columnName,
      body,
    }).unwrap();
  };

  return {
    column,
    columnOptions,
    setColumnOptions,
  };
};

export const useColumnsForView = () => {
  const { viewId } = useDataSourceContext();
  const { data: columnsResponse, isLoading: columnsAreLoading } =
    useGetColumnsQuery(
      {
        viewId,
      },
      { skip: !viewId }
    );
  const columns = useMemo(() => columnsResponse?.data, [columnsResponse?.data]);

  return { columns, columnsAreLoading };
};

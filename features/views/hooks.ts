import { activeColumnSelector } from "@/features/views/state-slice";
import { getColumnOptions } from "@/features/fields";
import { updateColumn } from "@/features/views/state-slice";
import { useAppDispatch, useDataSourceContext } from "@/hooks";
import { useAppSelector } from "@/hooks";
import { useMemo } from "react";
import { useUpdateColumnMutation } from "@/features/views/api-slice";

export const useUpdateColumn = () => {
  const dispatch = useAppDispatch();
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
    const patch = dispatch(updateColumn({ columnName, payload }));
    console.log('patch->', patch)
    const result = updateColumnOnServer({
      viewId,
      columnName,
      body: payload,
    }).unwrap();
  };

  return {
    column,
    columnOptions,
    setColumnOptions,
  };
};

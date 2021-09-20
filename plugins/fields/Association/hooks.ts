import { Field } from "@/features/fields/types"
import { setSidebarVisibile as setSidebarVisibileToState, sidebarsVisibleSelector } from "@/features/app/state-slice"
import { useAppDispatch, useAppSelector } from "@/hooks"
import { useEffect } from "react"

const useForeignName = (field: Field) => {
  const getForeignName = (record: any) => {
    const nameColumn: any = field?.column?.fieldOptions?.nameColumn;
    if (record && nameColumn) {
      return `${record[nameColumn]} (${record.id})`;
    }

    return null;
  };

  return getForeignName;
};

export const useSidebarsVisible = (initialvalue?: boolean) => {
  const dispatch = useAppDispatch()
  const sidebarsVisible = useAppSelector(sidebarsVisibleSelector)

  const setSidebarsVisible = (value: boolean) => {
    dispatch(setSidebarVisibileToState(value))
  }

  useEffect(() => {
    if (initialvalue) setSidebarsVisible(initialvalue)
  }, [])

  return [sidebarsVisible, setSidebarsVisible] as const
}

export { useForeignName };

import { FilterConditions, IFilter } from "@/features/tables/components/Filter";
import IntConditionComponent from "./IntConditionComponent";
import StringConditionComponent from "./StringConditionComponent";

function ConditionComponent({
  filter,
  onChange,
  ...rest
}: {
  filter: IFilter;
  onChange: (condition: FilterConditions) => void;
}) {
  let Component;
  const { column } = filter;

  switch (column.fieldType) {
    case "Id":
    case "Number":
    case "Association":
    case "Boolean":
      Component = IntConditionComponent;
      break;
    default:
    case "Text":
      Component = StringConditionComponent;
      break;
  }

  return <Component filter={filter} onChange={onChange} {...rest} />;
}

export default ConditionComponent;

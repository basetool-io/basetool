import { Filter, FilterConditions } from "@/features/tables/components/FilterRow";
import IntConditionComponent from "./IntConditionComponent";
import StringConditionComponent from "./StringConditionComponent";

function ConditionComponent({
  filter,
  onChange,
  ...rest
}: {
  filter: Filter;
  onChange: (condition: FilterConditions) => void;
}) {
  let Component;
  const { column } = filter;

  switch (column.fieldType) {
    case "Id":
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

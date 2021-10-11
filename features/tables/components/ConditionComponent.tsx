import { FilterConditions, IFilter } from "@/features/tables/components/Filter";
import BooleanConditionComponent from "./BooleanConditionComponent";
import IntConditionComponent from "./IntConditionComponent";
import SelectConditionComponent from "./SelectConditionComponent";
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
      Component = IntConditionComponent;
      break;
    case "Boolean":
      Component = BooleanConditionComponent;
      break;
    case "Select":
      Component = SelectConditionComponent;
      break;
    default:
    case "Text":
      Component = StringConditionComponent;
      break;
  }

  return <Component filter={filter} onChange={onChange} {...rest} />;
}

export default ConditionComponent;

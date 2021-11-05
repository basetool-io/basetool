import { Field } from "../../types";
import { ReactNode, memo } from "react";
import { bgColors } from "@/lib/colors";
import { evaluateBinding } from "@/features/code/evaluator";
import classNames from "classnames";

const IndexFieldWrapper = ({
  field,
  children,
  flush = false,
}: {
  field: Field;
  children: ReactNode;
  flush?: boolean;
}) => {
  const styles: Record<string, string> = {};
  const classes: string[] = [];

  // Apply the background color if set
  if (field.column.baseOptions.backgroundColor) {
    const color = evaluateBinding({
      context: { record: field.record, value: field.value },
      input: field.column.baseOptions.backgroundColor,
    });

    if (color) {
      if (bgColors.includes(color)) {
        classes.push(`bg-${color}-200`);
      } else {
        styles.backgroundColor = color;
      }
    }
  }

  return (
    <div
      style={styles}
      className={classNames(
        "leading-tight whitespace-no-wrap overflow-hidden overflow-ellipsis px-4 whitespace-nowrap text-sm text-gray-700 truncate h-full flex items-center",
        {
          "py-0": flush,
          "py-3": !flush,
        },
        classes
      )}
    >
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default memo(IndexFieldWrapper);

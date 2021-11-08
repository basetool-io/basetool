import { Switch } from "@chakra-ui/react";
import { Views } from "@/features/fields/enums";
import { humanize } from "@/lib/humanize";
import { isArray, uniq } from "lodash";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect, useState } from "react";

function VisibilityOption() {
  const { column, columnOptions, setColumnOptions } = useUpdateColumn();

  const [visibility, setVisibility] = useState<Views[]>([]);

  useEffect(() => {
    if (column && isArray(column?.baseOptions?.visibility)) {
      setVisibility(uniq(column.baseOptions.visibility.filter(Boolean)));
    }
  }, [column]);

  useEffect(() => {
    if (isArray(visibility)) {
      setColumnOptions(column.name, {
        baseOptions: {
          visibility,
        },
      });
    }
  }, [visibility]);

  if (!column) return null;

  const changeVisibilityOption = (view: Views, checked: boolean) => {
    console.log(1, view, checked);
    if (checked) {
      setVisibility(uniq([...visibility, view].filter(Boolean)));
    } else {
      const index = visibility.indexOf(view);
      const newVisibility = [...visibility];
      delete newVisibility[index];
      console.log("newVisibility->", newVisibility);
      setVisibility(uniq(newVisibility.filter(Boolean)));
    }
  };

  console.log("column->", column);

  return (
    <OptionWrapper
      helpText="We try to infer the type of field from your data source.
      Sometimes we might not get it right the first time. Choose the appropiate type of field
      from these options"
      label="Field type"
      id="fieldType"
    >
      {Object.keys(Views).map((view) => (
        <div className="flex justify-between items-center">
          <div>{humanize(view)}</div>
          <Switch
            size="sm"
            isChecked={column.baseOptions.visibility.includes(view as Views)}
            onChange={(e) => {
              changeVisibilityOption(view, e.target.checked);
              // return setColumnOptions(column.name, {
              //   baseOptions: {
              //     visibility: { [view]: e.target.checked },
              //   },
              // })
            }}
          />
        </div>
      ))}
      <pre>{JSON.stringify(visibility, null, 2)}</pre>
    </OptionWrapper>
  );
}

export default VisibilityOption;

import { Switch } from "@chakra-ui/react";
import { Views } from "@/features/fields/enums";
import { humanize } from "@/lib/humanize";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React from "react";

function VisibilityOption() {
  const { column, columnOptions, setColumnOptions } = useUpdateColumn();

  if (!column) return null;

  return (
    <OptionWrapper
      helpText="We try to infer the type of field from your data source.
      Sometimes we might not get it right the first time. Choose the appropiate type of field
      from these options"
      label="Field type"
      id="fieldType"
    >
      {/* <pre>{JSON.stringify(column, null, 2)}</pre> */}
      {Object.keys(Views).map((view) => (
        <div className="flex justify-between items-center">
          <div>{humanize(view)}</div>
          <Switch
            size="sm"
            isChecked={column.baseOptions.visibility.includes(view as Views)}
            onChange={(e) =>
              setColumnOptions(column.name, {
                baseOptions: {
                  visibility: { [view]: e.target.checked },
                },
              })
            }
          />
        </div>
      ))}
    </OptionWrapper>
  );
}

export default VisibilityOption;

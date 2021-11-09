import { Switch } from "@chakra-ui/react";
import { Views } from "@/features/fields/enums";
import { humanize } from "@/lib/humanize";
import { isArray, uniq, without } from "lodash";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionsWrapper";
import React, { useEffect, useState } from "react";

function VisibilityOption() {
  const { column, setColumnOptions } = useUpdateColumn();

  const [visibility, setVisibility] = useState<Views[]>([]);

  useEffect(() => {
    if (column && isArray(column?.baseOptions?.visibility)) {
      setVisibility(uniq(column.baseOptions.visibility.filter(Boolean)));
    }
  }, [column?.baseOptions?.visibility]);

  useEffect(() => {
    if (column && column?.name && isArray(visibility)) {
    }
  }, [visibility]);

  if (!column) return null;

  const changeVisibilityOption = (view: Views, checked: boolean) => {
    let newVisibility;

    if (checked) {
      newVisibility = [...visibility, view];
    } else {
      newVisibility = without(visibility, view);
    }

    setColumnOptions(column.name, {
      baseOptions: {
        visibility: uniq(newVisibility.filter(Boolean)),
      },
    });
  };

  return (
    <OptionWrapper
      helpText={
        <>
          By default, all fields are visible in all views. But maybe some
          shouldn't be? 🤔
          <br />
          You can control where the field is visible here.
        </>
      }
      label="Visibility"
      id="visibility"
    >
      {Object.keys(Views).map((view) => (
        <div className="flex justify-between items-center">
          <div>{humanize(view)}</div>
          <Switch
            size="sm"
            isChecked={visibility.includes(view as Views)}
            onChange={(e) => {
              changeVisibilityOption(view as Views, e.target.checked);
            }}
          />
        </div>
      ))}
    </OptionWrapper>
  );
}

export default VisibilityOption;

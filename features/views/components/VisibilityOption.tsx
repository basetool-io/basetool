import { Switch } from "@chakra-ui/react";
import { Views } from "@/features/fields/enums";
import { humanize } from "@/lib/humanize";
import { isArray, uniq, without } from "lodash";
import { useSegment } from "@/hooks"
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useEffect, useMemo, useState } from "react";

function VisibilityOption() {
  const track = useSegment();
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

  const isComputed = useMemo(
    () => column?.baseOptions?.computed === true,
    [column]
  );

  const filteredColumns = useMemo(
    () => (isComputed ? ["index", "show"] : Object.keys(Views)),
    [isComputed, Views]
  );

  if (!column) return null;

  const changeVisibilityOption = (view: Views, checked: boolean) => {
    let newVisibility;
    track("Updated visibility column option.");

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
      {filteredColumns.map((view) => (
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

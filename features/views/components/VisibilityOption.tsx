import { Switch } from "@chakra-ui/react";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useMemo } from "react";

function VisibilityOption() {
  const { column, setColumnOptions } = useUpdateColumn();

  const isComputed = useMemo(
    () => column?.baseOptions?.computed === true,
    [column]
  );

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
      <div className="flex justify-between items-center">
        <div>Index</div>
        <Switch
          size="sm"
          isChecked={column?.baseOptions?.visibleOnIndex}
          onChange={(e) => {
            setColumnOptions(column?.name || "", {
              baseOptions: {
                visibleOnIndex: e.currentTarget.checked,
              },
            });
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <div>Show</div>
        <Switch
          size="sm"
          isChecked={column?.baseOptions?.visibleOnShow}
          onChange={(e) => {
            setColumnOptions(column?.name || "", {
              baseOptions: {
                visibleOnShow: e.currentTarget.checked,
              },
            });
          }}
        />
      </div>
      {!isComputed && (
        <>
          <div className="flex justify-between items-center">
            <div>Edit</div>
            <Switch
              size="sm"
              isChecked={column?.baseOptions?.visibleOnEdit}
              onChange={(e) => {
                setColumnOptions(column?.name || "", {
                  baseOptions: {
                    visibleOnEdit: e.currentTarget.checked,
                  },
                });
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div>New</div>
            <Switch
              size="sm"
              isChecked={column?.baseOptions?.visibleOnNew}
              onChange={(e) => {
                setColumnOptions(column?.name || "", {
                  baseOptions: {
                    visibleOnNew: e.currentTarget.checked,
                  },
                });
              }}
            />
          </div>
        </>
      )}
    </OptionWrapper>
  );
}

export default VisibilityOption;

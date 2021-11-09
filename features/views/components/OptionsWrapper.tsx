import { FormControl, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { isString, snakeCase } from "lodash";
import React, { ReactNode, memo } from "react";

const OptionWrapper = ({
  helpText,
  label,
  id,
  children,
}: {
  helpText?: string | ReactNode;
  label?: string | ReactNode;
  id?: string;
  children: ReactNode;
}) => {
  if (isString(label)) id ||= snakeCase(label.toLowerCase());

  return (
    <div className="relative px-4">
      <FormControl id={id}>
        <div className="relative flex justify-between mb-1">
          <label
            className="text-sm font-semibold text-true-gray-600 flex"
            htmlFor={id}
          >
            {label}
          </label>
          <div>
            <Tooltip placement="top" label={helpText}>
              <div>
                <InformationCircleIcon className="block h-4 text-gray-600" />
              </div>
            </Tooltip>
          </div>
        </div>
        <div>{children}</div>
      </FormControl>
    </div>
  );
};

export default memo(OptionWrapper);

import { FormControl, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import React, { ReactNode } from "react";

const OptionWrapper = ({
  helpText,
  label,
  id,
  children,
  fullWidth = false,
}: {
  helpText?: string | ReactNode;
  label?: string;
  id?: string;
  children: ReactNode;
  fullWidth?: boolean;
}) => {
  return (
    <div className="relative flex-1 flex flex-col space-y-4 px-4">
      <FormControl id={id}>
        <div className="relative flex justify-between mb-2">
          <label
            className="text-sm font-semibold text-true-gray-600 flex"
            htmlFor={id}
          >
            {label}
          </label>
          <div className="">
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

export default OptionWrapper;

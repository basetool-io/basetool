import { ReactNode, memo } from "react";
import classNames from "classnames";

const OptionWrapper = ({
  helpText,
  children,
  fullWidth = false,
}: {
  helpText?: string | ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}) => {
  return (
    <div className="flex-1 flex space-x-8 py-4">
      <div className={classNames({ "w-1/2": !fullWidth, "w-full": fullWidth })}>
        {children}
      </div>
      {!fullWidth && (
        <div className="w-1/2 mt-6">
          {helpText && (
            <div className="text-sm text-blue-gray-500 whitespace-pre-line">
              {helpText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(OptionWrapper);

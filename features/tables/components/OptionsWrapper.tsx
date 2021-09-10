import { ReactNode } from "react"

const OptionWrapper = ({
  helpText,
  children,
}: {
  helpText?: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex-1 flex space-x-8 py-4">
      <div className="w-1/2">{children}</div>
      <div className="w-1/2 mt-6">
        {helpText && (
          <div className="text-sm text-blue-gray-500 whitespace-pre-line">
            {helpText}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionWrapper;

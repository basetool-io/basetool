import { memo } from "react";

const ErrorMessage = ({
  message = "Oh no, There's been an error...",
  error,
}: {
  message?: string;
  error?: string;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <div className="text-xl font-bold">{message}</div>
        {error && <div className="mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default memo(ErrorMessage);

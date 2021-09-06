import { ReactNode } from "react"
import LoadingComponent from "./LoadingComponent";
import classNames from "classnames";

const LoadingOverlay = ({
  label,
  transparent = false,
  children
}: {
  label?: string;
  transparent?: boolean;
  children?: ReactNode
}) => {
  return (
    <div
      className={classNames(
        "absolute flex items-center justify-center h-full w-full inset-0 bg-opacity-75 z-20 rounded-xl",
        { "bg-white": !transparent }
      )}
    >
      <LoadingComponent label={label}>{children}</LoadingComponent>
    </div>
  );
};

export default LoadingOverlay;

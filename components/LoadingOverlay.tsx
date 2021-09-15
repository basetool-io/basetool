import { ReactNode } from "react"
import LoadingComponent from "./LoadingComponent";
import classNames from "classnames";

const LoadingOverlay = ({
  label,
  transparent = false,
  inPageWrapper,
  children,
  className
}: {
  label?: string;
  transparent?: boolean;
  inPageWrapper?: boolean;
  children?: ReactNode
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        "absolute flex items-center justify-center inset-0 bg-opacity-75 z-20 rounded",
        { "bg-white": !transparent },
        { "inset-[1rem]": inPageWrapper },
        className
      )}
    >
      <LoadingComponent label={label}>{children}</LoadingComponent>
    </div>
  );
};

export default LoadingOverlay;

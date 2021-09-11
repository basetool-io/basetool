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
        "absolute flex items-center justify-center inset-0 bg-opacity-25 z-20 rounded backdrop-filter backdrop-blur",
        { "bg-white": !transparent },
        { "inset-[0.5rem]": inPageWrapper },
        className
      )}
    >
      <LoadingComponent label={label}>{children}</LoadingComponent>
    </div>
  );
};

export default LoadingOverlay;

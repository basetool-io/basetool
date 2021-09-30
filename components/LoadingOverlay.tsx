import { ReactNode, memo } from "react"
import LoadingComponent from "./LoadingComponent";
import classNames from "classnames";

const LoadingOverlay = ({
  label,
  subTitle,
  transparent = false,
  inPageWrapper,
  children,
  className
}: {
  label?: string;
  subTitle?: string | boolean;
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
      <LoadingComponent label={label} subTitle={subTitle}>{children}</LoadingComponent>
    </div>
  );
};

export default memo(LoadingOverlay);

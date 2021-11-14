import { ReactNode } from "react";
import classNames from "classnames";

const TinyLabel = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode | string;
}) => (
  <span
    className={classNames(
      "text-sm font-bold uppercase text-gray-800 leading-none",
      className
    )}
  >
    {children}
  </span>
);

export default TinyLabel;

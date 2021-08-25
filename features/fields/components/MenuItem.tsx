import { ReactNode, memo } from "react";

const MenuItem = ({
  children,
  ...rest
}: {
  children: ReactNode;
  [rest: string]: any;
}) => (
  <a
    className="uppercase font-bold text-sm text-gray-600 cursor-pointer"
    {...rest}
  >
    {children}
  </a>
);

export default memo(MenuItem);

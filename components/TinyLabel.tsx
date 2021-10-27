import { ReactNode } from "react";

const TinyLabel = ({ children }: { children: ReactNode | string }) => (
  <span className="text-sm font-bold uppercase text-gray-800 leading-none">
    {children}
  </span>
);

export default TinyLabel;

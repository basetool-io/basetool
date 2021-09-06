import { ReactElement } from "hoist-non-react-statics/node_modules/@types/react";
import React from "react";

function PageWrapper({ heading, status, buttons, children }: { heading?: string, status?: ReactElement, buttons?: ReactElement, children: ReactElement }) {
  return (
    <>
      <div className="flex flex-col flex-1 px-4 py-4">
        <div className="flex justify-between mb-4">
          <div className="flex flex-col justify-between">
            {heading && <div className="text-xl text-gray-800">{heading}</div>}
            {status}
          </div>
          <div className="flex justify-end items-center">{buttons}</div>
        </div>
        <div className="flex flex-1 flex-col bg-white px-4 py-4 shadow sm:rounded-lg">
          {children}
        </div>
      </div>
    </>
  );
}

export default PageWrapper;

import React, { ReactElement } from "react";
import classNames from "classnames";

function PageWrapper({
  heading,
  status,
  buttons,
  children,
  flush = false,
}: {
  heading?: string;
  status?: ReactElement;
  buttons?: ReactElement;
  children: ReactElement;
  flush?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col flex-1 px-4 py-4 w-full">
        <div
          className={classNames(
            "flex flex-1 flex-col bg-white shadow sm:rounded-lg"
          )}
        >
          <div className={classNames("flex justify-between border-b p-4")}>
            <div className="flex flex-col justify-between">
              {heading && (
                <div className="text-xl text-gray-800">{heading}</div>
              )}
              {status}
            </div>
            <div className="flex justify-end items-center">{buttons}</div>
          </div>
          <div
            className={classNames("flex-1 flex flex-col", {
              "px-4 py-4": !flush,
            })}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default PageWrapper;

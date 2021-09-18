import React, { ReactElement } from "react";
import classNames from "classnames";

function PageWrapper({
  heading,
  status,
  buttons,
  children,
  icon,
  flush = false,
}: {
  heading?: string | ReactElement;
  status?: ReactElement;
  buttons?: ReactElement;
  children: ReactElement;
  icon?: ReactElement;
  flush?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col flex-1 px-2 py-2 w-full">
        <div
          className={classNames(
            "flex flex-1 flex-col bg-white shadow sm:rounded-lg"
          )}
        >
          <div className={classNames("flex justify-between border-b p-4")}>
            <div className="flex flex-col justify-between items-center">
              {heading && (
                <div className="text-xl text-gray-800 flex items-center space-x-1">{icon && icon} <span>{heading}</span></div>
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

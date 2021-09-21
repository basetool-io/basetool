import { Button } from "@chakra-ui/react";
import { Sidebar } from "react-feather";
import { useSidebarsVisible } from "@/hooks";
import React, { ReactElement } from "react";
import classNames from "classnames";

function PageWrapper({
  heading,
  buttons,
  children,
  icon,
  flush = false,
}: {
  heading?: string | ReactElement;
  buttons?: ReactElement;
  children: ReactElement;
  icon?: ReactElement;
  flush?: boolean;
}) {
  const [sidebarsVisible, setSidebarVisible] = useSidebarsVisible();

  return (
    <>
      <div className="flex flex-col flex-1 px-2 py-2 min-w-64 w-full">
        <div
          className={classNames(
            "flex flex-1 flex-col bg-white shadow sm:rounded-lg"
          )}
        >
          <div className={classNames("flex justify-between border-b p-4 flex-col md:flex-row space-y-2 md:space-y-0")}>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarsVisible)}
                display={{ md: "none" }}
                className="flex flex-shrink-0 mr-2"
              >
                <Sidebar className="h-4 w-4" />
              </Button>
              {heading && (
                <div className="text-xl text-gray-800 flex items-center space-x-1">
                  {icon && icon} <span>{heading}</span>
                </div>
              )}
            </div>
            <div className="flex justify-start md:justify-end items-center">{buttons}</div>
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

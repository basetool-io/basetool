import { Button } from "@chakra-ui/react";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { FooterElements } from "@/types"
import { SerializedError } from "@reduxjs/toolkit";
import { Sidebar } from "react-feather";
import { useSidebarsVisible } from "@/hooks";
import Link from "next/link";
import LoadingOverlay from "./LoadingOverlay";
import React, { ReactElement, ReactNode } from "react";
import classNames from "classnames";

const Heading = ({ children }: { children: string | ReactNode }) => (
  <div className="uppercase font-semibold mb-2 pb-1">{children}</div>
);

const Section = ({ children }: { children: ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const Blocks = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-4 auto-cols-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
);

const Block = ({
  href,
  children,
  onMouseOver,
}: {
  href?: string;
  children: ReactNode;
  onMouseOver?: () => void;
}) => {
  const content = (
    <div
      className="rounded-md border bg-true-gray-50 hover:bg-true-gray-100 hover:border-true-gray-300 p-4 h-full"
      onMouseOver={onMouseOver}
    >
      {children}
    </div>
  );

  if (href)
    return (
      <Link href={href}>
        <a>{content}</a>
      </Link>
    );

  return content;
};

const TitleCrumbs = ({ crumbs }: { crumbs: Array<string | undefined> }) => {
  return (
    <>
      {crumbs &&
        crumbs.map((crumb, idx) => {
          if (idx === crumbs.length - 1) {
            return <span key={idx}>{crumb}</span>;
          }

          return (
            <span key={idx} className="tracking-tight">
              {crumb}{" "}
              <ChevronRightIcon className="h-4 text-gray-400 inline -mt-0" />{" "}
            </span>
          );
        })}
    </>
  );
};

const Footer = ({
  left,
  center,
  right,
}: FooterElements) => (
  <div className="sticky top-auto bottom-0 w-[calc(100%+0.5rem)] -ml-1 bg-white shadow-pw-footer rounded-t py-[calc(0.5rem+1px)] z-30">
    <div className="flex justify-evenly items-center px-4">
      <div className="flex-1 flex justify-start">{left}</div>
      <div className="min-h-[2rem]">{center}</div>
      <div className="flex-1 flex justify-end">{right}</div>
    </div>
  </div>
);

function PageWrapper({
  heading,
  crumbs,
  buttons,
  children,
  icon,
  flush = false,
  isLoading = false,
  className,
  footer,
  footerElements,
  error,
}: {
  heading?: string | ReactElement;
  crumbs?: Array<string | undefined>;
  buttons?: ReactElement;
  children?: ReactElement | string;
  icon?: ReactElement;
  flush?: boolean;
  isLoading?: boolean;
  className?: string;
  footer?: ReactElement;
  footerElements?: FooterElements;
  error?: FetchBaseQueryError | SerializedError | undefined;
}) {
  const [sidebarsVisible, setSidebarVisible] = useSidebarsVisible();

  return (
    <>
      <div
        className={classNames(
          "flex flex-col flex-1 px-2 pt-2 min-w-64 w-full",
          className,
          { "pb-2": !footer && !footerElements }
        )}
      >
        <div
          className={classNames(
            "relative flex flex-1 flex-col bg-white shadow sm:rounded-lg"
          )}
        >
          {(heading || crumbs || icon) && (
            <div
              className={classNames(
                "relative flex justify-between border-b p-4 flex-col md:flex-row space-y-2 md:space-y-0"
              )}
            >
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
                <div className="text-xl text-gray-800 flex items-center space-x-1">
                  {!error && (
                    <>
                      {icon}
                      {heading && <span>{heading}</span>}
                      {crumbs && <TitleCrumbs crumbs={crumbs} />}
                    </>
                  )}

                  {error &&
                    (("status" in error && error.status) ||
                      ("name" in error && error.name) ||
                      "Error")}
                </div>
              </div>
              <div className="flex justify-start md:justify-end items-center">
                {buttons}
              </div>
            </div>
          )}
          <div
            className={classNames("relative flex-1 flex flex-col", {
              "px-4 py-4": !flush,
            })}
          >
            {isLoading && <LoadingOverlay inPageWrapper />}
            {!error && children}
            {error && "data" in error && (
              <div className="p-4">
                {(error as any)?.data?.messages[0]}
                {(error as any)?.data?.meta?.errorMessage && (
                  <>
                    <div className="uppercase font-bold text-sm mt-4">
                      Message:
                    </div>
                    <div className="text-sm">
                      {(error as any)?.data?.meta?.errorMessage}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {footer && footer}
          {footerElements && (
            <Footer
              left={footerElements.left}
              center={footerElements.center}
              right={footerElements.right}
            />
          )}
        </div>
      </div>
    </>
  );
}

PageWrapper.TitleCrumbs = TitleCrumbs;
PageWrapper.Heading = Heading;
PageWrapper.Section = Section;
PageWrapper.Blocks = Blocks;
PageWrapper.Block = Block;
PageWrapper.Footer = Footer;

export default PageWrapper;

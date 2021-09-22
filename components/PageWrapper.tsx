import { Button } from "@chakra-ui/react";
import { ChevronRightIcon } from "@heroicons/react/outline"
import { Sidebar } from "react-feather";
import { useSidebarsVisible } from "@/hooks";
import Link from "next/link";
import React, { ReactElement, ReactNode } from "react";
import classNames from "classnames";

const Heading = ({ children }: { children: string }) => (
  <div className="uppercase font-semibold mb-2 pb-1">{children}</div>
);

const Section = ({ children }: { children: ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const Blocks = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-4 grid-cols-4">{children}</div>
);

const Block = ({ href, children }: { href?: string; children: ReactNode }) => {
  const content = (
    <div className="rounded-md border shadow-glow bg-true-gray-50 p-4">{children}</div>
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
            <span key={idx}>
              {crumb}{" "}
              <ChevronRightIcon className="h-4 text-gray-400 inline -mt-1" />{" "}
            </span>
          );
        })}
    </>
  );
};

function PageWrapper({
  heading,
  crumbs,
  buttons,
  children,
  icon,
  flush = false,
}: {
  heading?: string | ReactElement;
  crumbs?: Array<string | undefined>;
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
          <div
            className={classNames(
              "flex justify-between border-b p-4 flex-col md:flex-row space-y-2 md:space-y-0"
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
                {icon}
                {heading && <span>{heading}</span>}
                {crumbs && <TitleCrumbs crumbs={crumbs} />}
              </div>
            </div>
            <div className="flex justify-start md:justify-end items-center">
              {buttons}
            </div>
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

PageWrapper.TitleCrumbs = TitleCrumbs;
PageWrapper.Heading = Heading;
PageWrapper.Section = Section;
PageWrapper.Blocks = Blocks;
PageWrapper.Block = Block;

export default PageWrapper;

import {
  ClockIcon,
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import { DataSource } from "@prisma/client";
import { OWNER_ROLE } from "@/features/roles";
import { Tooltip } from "@chakra-ui/react";
import { isUndefined } from "lodash";
import {
  useDarkMode,
  useDataSourceContext,
  useProfile,
  useSidebarsVisible,
} from "@/hooks";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { usePrefetch } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Avatar from "react-avatar";
import Link from "next/link";
import React, { ReactNode, memo } from "react";
import classNames from "classnames";

const DataSourceItem = ({
  active,
  label,
  link,
  icon,
  initials,
  compact,
  flush = false,
  onClick,
  ...rest
}: {
  active?: boolean;
  label: string;
  link?: string;
  icon?: ReactNode;
  initials?: ReactNode;
  compact?: boolean;
  flush?: boolean;
  onClick?: () => void;
  [name: string]: any;
}) => {
  const linkElement = (
    <a className="block" onClick={onClick} {...rest}>
      <Tooltip label={label} placement="right" gutter={15}>
        <div
          className={classNames(
            "flex items-center text-white font-normal cursor-pointer text-sm rounded-md leading-none h-12",
            { "hover:bg-cool-gray-600 dark:hover:bg-cool-gray-500": !active },
            { "bg-cool-gray-800 hover:bg-cool-gray-900 inner-shadow dark:bg-cool-gray-500 dark:hover:bg-cool-gray-600": active },
            { "py-3 px-3": !flush },
            { "w-12 justify-center": compact },
            { "w-full ": !compact }
          )}
        >
          {compact && initials}
          {compact && icon}
          {!compact && (
            <>
              {icon && <span className="mr-2">{icon}</span>}
              <span className="overflow-hidden whitespace-nowrap overflow-ellipsis font-semibold">
                {label}
              </span>
            </>
          )}
        </div>
      </Tooltip>
    </a>
  );

  return (
    <>
      {!isUndefined(link) || linkElement}
      {!isUndefined(link) && (
        <Link href={link} passHref>
          {linkElement}
        </Link>
      )}
    </>
  );
};

const DataSourcesSidebar = () => {
  const router = useRouter();
  const [sidebarsVisible] = useSidebarsVisible();
  const compact = true;
  const { user, role, isLoading: sessionIsLoading } = useProfile();
  const { data: dataSourcesResponse, isLoading } = useGetDataSourcesQuery(
    undefined,
    {
      skip: !user.email,
    }
  );
  const prefetchTables = usePrefetch("getTables");
  const { dataSourceId } = useDataSourceContext();
  const { colorTheme, setTheme } = useDarkMode();

  return (
    <div
      className={classNames("flex flex-1 flex-grow-0 flex-shrink-0", {
        "w-2 md:w-[4rem]": !sidebarsVisible,
        "w-[4rem]": sidebarsVisible,
      })}
    >
      <div className="py-2 px-2 flex-1 h-screen bg-cool-gray-700 text-white dark:bg-cool-gray-400 dark:text-cool-gray-700 w-full overflow-y-auto">
        {dataSourcesResponse?.ok && (
          <div className="space-y-x w-full h-full flex flex-col justify-between">
            <div>
              <div className="space-y-2">
                <Link href={`/`} passHref>
                  <a className="block">
                    <Tooltip label="Home" placement="right" gutter={15}>
                      <span
                        className={classNames(
                          "flex items-center justify-center text-white font-normal cursor-pointer text-sm rounded-md leading-none h-12",
                          { "hover:bg-cool-gray-600 dark:hover:bg-cool-gray-600": router.asPath !== "/" },
                          {
                            "bg-cool-gray-800 hover:bg-cool-gray-900 inner-shadow dark:bg-cool-gray-500 dark:hover:bg-cool-gray-600":
                              router.asPath === "/",
                          }
                        )}
                      >
                        <HomeIcon className="h-6 inline-block" />
                      </span>
                    </Tooltip>
                  </a>
                </Link>

                {isLoading && (
                  <DataSourceItem
                    active={false}
                    compact={compact}
                    initials={<ClockIcon className="h-6 w-6 text-white" />}
                    flush={true}
                    label={""}
                  />
                )}
                {!isLoading &&
                  dataSourcesResponse?.ok &&
                  dataSourcesResponse.data.map((dataSource: DataSource) => {
                    const active = parseInt(dataSourceId) === dataSource.id;
                    let name = dataSource.name.replace(/[^a-zA-Z ]/g, "");
                    if (name == name.toUpperCase()) {
                      name = name.split("").join(" ");
                    }

                    return (
                      <DataSourceItem
                        key={dataSource.id}
                        active={active}
                        compact={compact}
                        initials={
                          <Avatar
                            name={name}
                            maxInitials={3}
                            round={true}
                            size="40"
                            color="transparent"
                          />
                        }
                        link={`/data-sources/${dataSource.id}`}
                        label={dataSource.name}
                        onMouseOver={() => {
                          prefetchTables({
                            dataSourceId: dataSource.id.toString(),
                          });
                        }}
                      />
                    );
                  })}
                <DataSourceItem
                  active={router.asPath.includes(`/data-sources/new`)}
                  compact={compact}
                  icon={
                    <PlusIcon className="flex flex-shrink-0 h-4 text-white" />
                  }
                  link={"/data-sources/new"}
                  label="Add new data source"
                />
              </div>
            </div>
            <div className="space-y-2">
              {/* @todo: link to docs */}
              {/* @todo: link to feature request */}
              {/* @todo: link to complaints */}

              {/* Dark mode switch */}
              <DataSourceItem
                compact={compact}
                icon={colorTheme === "light" ? (
                  <svg
                    onClick={() => setTheme("light")}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 hover:text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                ) : (
                  <svg
                    onClick={() => setTheme("dark")}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 hover:text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
                label={colorTheme === "light" ? "Switch to light mode" : `Switch to dark mode`}
              />

              {/* Show the beta page only to owners */}
              {role && role.name === OWNER_ROLE && (
                <Link href="/beta" passHref>
                  <a className="block">
                    <div
                      className={classNames(
                        "flex-1 flex text-gray-300 hover:text-white dark:hover:text-cool-gray-700 font-normal cursor-pointer text-sm rounded-md leading-none p-1",
                        {
                          "bg-cool-gray-800 hover:bg-cool-gray-900 dark:bg-cool-gray-600 hover:dark:bg-cool-gray=700 inner-shadow leading-none":
                            router.asPath === `/beta`,
                        }
                      )}
                    >
                      <div className="w-full text-center uppercase text-sm font-bold">
                        Beta
                      </div>
                    </div>
                  </a>
                </Link>
              )}
              <DataSourceItem
                active={router.asPath.includes(`/profile`)}
                compact={compact}
                icon={<UserCircleIcon className="h-6 w-6 text-white" />}
                link={`/profile`}
                label={sessionIsLoading ? "Loading" : `Your profile`}
              />
              {/* <div onClick={() => setCompact(!compact)}>
                <DataSourceItem
                  compact={compact}
                  icon={<Sidebar className="h-5 w-5 text-white ml-px mr-1" />}
                  label={compact ? "Expand sidebar" : `Pin sidebar`}
                />
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DataSourcesSidebar);

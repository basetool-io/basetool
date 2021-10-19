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
import { useDataSourceContext, useProfile, useSidebarsVisible } from "@/hooks";
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
            { "hover:bg-cool-gray-600": !active },
            { "bg-cool-gray-800 hover:bg-cool-gray-900 inner-shadow": active },
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
  const { role, isLoading: sessionIsLoading } = useProfile();
  const { data: dataSourcesResponse, isLoading } = useGetDataSourcesQuery();
  const prefetchTables = usePrefetch("getTables");
  const { dataSourceId } = useDataSourceContext();

  return (
    <div
      className={classNames("flex flex-1 flex-grow-0 flex-shrink-0", {
        "w-2 md:w-[4rem]": !sidebarsVisible,
        "w-[4rem]": sidebarsVisible,
      })}
    >
      <div className="py-2 px-2 flex-1 h-screen bg-cool-gray-700 text-white w-full overflow-y-auto">
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
                          { "hover:bg-cool-gray-600": router.asPath === "/" },
                          {
                            "bg-cool-gray-800 hover:bg-cool-gray-900 inner-shadow":
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

              {/* Show the beta page only to owners */}
              {role && role.name === OWNER_ROLE && (
                <Link href="/beta" passHref>
                  <a className="block">
                    <div
                      className={classNames(
                        "flex-1 flex text-gray-300 hover:text-white font-normal cursor-pointer text-sm rounded-md leading-none p-1",
                        {
                          "bg-cool-gray-800 hover:bg-cool-gray-900 inner-shadow leading-none":
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

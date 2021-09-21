import {
  ClockIcon,
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import { DataSource } from "@prisma/client";
import { Tooltip } from "@chakra-ui/react";
import { isUndefined } from "lodash";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import { useSidebarsVisible } from "@/hooks"
import Avatar from "react-avatar";
import Link from "next/link";
import React, { ReactNode, memo } from "react";
import classNames from "classnames";
import isNull from "lodash/isNull";

const DataSourceItem = ({
  active,
  label,
  link,
  icon,
  initials,
  compact,
  flush = false,
  onClick
}: {
  active?: boolean;
  label: string;
  link?: string;
  icon?: ReactNode;
  initials?: ReactNode;
  compact?: boolean;
  flush?: boolean;
  onClick?: () => void;
}) => {
  const linkElement = (
    <a className="block" onClick={onClick}>
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
  const [sidebarsVisible] = useSidebarsVisible()
  const compact = true;
  // const visible = true;
  // const [compact, setCompact] = useLocalStorage(
  //   `${LOCAL_STORAGE_PREFIX}:datasources-sidebar-compact`,
  //   true,
  // );
  const [session, sessionIsLoading] = useSession();
  const { data: dataSourcesResponse, isLoading } = useGetDataSourcesQuery();

  return (
    <div
      className={classNames("flex flex-grow-0 flex-shrink-0", {
        "w-2 md:w-[4rem]": !sidebarsVisible,
        "w-[4rem]": sidebarsVisible,
      })}
    >
      <div className="py-2 px-2 h-screen bg-cool-gray-700 text-white w-full">
        {isLoading && <>&nbsp;</>}
        {dataSourcesResponse?.ok && (
          <div className="space-y-x w-full h-full flex flex-col justify-between">
            <div>
              <div className="space-y-2">
                <Link href={`/data-sources`} passHref>
                  <a className="block">
                    <Tooltip label="Home" placement="right" gutter={15}>
                      <span
                        className={classNames(
                          "flex items-center justify-center space-x-1 text-white cursor-pointer mb-4 mt-2"
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
                    const reg = new RegExp(
                      String.raw`/data-sources/${dataSource.id.toString()}($|/|\?)`
                    );

                    const active = !isNull(router.asPath.match(reg));
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
                  label="New data source"
                />
              </div>
            </div>
            <div className="space-y-2">
              {/* @todo: link to docs */}
              {/* @todo: link to feature request */}
              {/* @todo: link to complaints */}
              {/* <DataSourceItem
                active={router.asPath.includes(`/settings`)}
                compact={compact}
                icon={<CogIcon className="h-6 w-6 text-white" />}
                link={`/settings`}
                label="Settings"
              /> */}
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

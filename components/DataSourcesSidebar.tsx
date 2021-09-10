import {
  CogIcon,
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import { DataSource } from "@prisma/client";
import { Tooltip } from "@chakra-ui/react";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import Avatar from "react-avatar";
import Link from "next/link";
import LoadingComponent from "./LoadingComponent";
import React, { ReactNode, memo } from "react";
import classNames from "classnames";

const DataSourceItem = ({
  active,
  label,
  link,
  icon,
}: {
  active?: boolean;
  label: string;
  link: string;
  icon?: ReactNode;
}) => {
  return (
    <Link href={link} passHref>
      <a className="block shadow">
        <Tooltip label={label} placement="right">
          <span
            className={classNames(
              "flex items-center justify-center w-12 h-12 rounded bg-cool-gray-400 text-white",
              "hover:bg-cool-gray-200 overflow-hidden overflow-ellipsis w-full",
              "block text-gray-800 hover:text-gray-800 font-normal cursor-pointer text-sm py-3 px-3 rounded-md leading-none",
              { "bg-cool-gray-300 hover:bg-cool-gray-200": active }
            )}
          >
            {icon}
          </span>
        </Tooltip>
      </a>
    </Link>
  );
};

const DataSourcesSidebar = () => {
  const router = useRouter();
  const [session, sessionIsLoading] = useSession();
  const { data: dataSourcesResponse, isLoading } = useGetDataSourcesQuery();

  return (
    <div className="py-2 px-2 h-screen bg-cool-gray-700 text-white">
      {dataSourcesResponse?.ok && (
        <div className="space-y-x w-full h-full flex flex-col justify-between">
          <div>
            {isLoading && <LoadingComponent />}
            {!isLoading && dataSourcesResponse?.ok && (
              <div className="space-y-2">
                <Link href={`/data-sources`} passHref>
                  <a className="block">
                    <Tooltip label="Home" placement="right">
                      <span className="flex items-center justify-center space-x-1 text-gray-700 cursor-pointer mb-4">
                        <HomeIcon className="h-6 inline-block text-white" />
                      </span>
                    </Tooltip>
                  </a>
                </Link>

                {!isLoading &&
                  dataSourcesResponse?.ok &&
                  dataSourcesResponse.data.map((dataSource: DataSource) => (
                    <DataSourceItem
                      key={dataSource.id}
                      active={router.asPath.includes(
                        `/data-sources/${dataSource.id}`
                      )}
                      icon={
                        <Avatar
                          name={
                            dataSource.name == dataSource.name.toUpperCase()
                              ? dataSource.name.split("").join(" ")
                              : dataSource.name
                          }
                          maxInitials={3}
                          round={true}
                          size="40"
                          color="transparent"
                          fgColor="#000000"
                        />
                      }
                      link={`/data-sources/${dataSource.id}`}
                      label={dataSource.name}
                    />
                  ))}
                <DataSourceItem
                  active={router.asPath.includes(`/data-sources/new`)}
                  icon={<PlusIcon className="h-4" />}
                  link={"/data-sources/new"}
                  label="Add new data source"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            {/* @todo: link to docs */}
            {/* @todo: link to feature request */}
            {/* @todo: link to complaints */}
            <DataSourceItem
              active={router.asPath.includes(`/settings`)}
              icon={<CogIcon className="h-8 w-8 text-gray-700" />}
              link={`/settings`}
              label="Settings"
            />
            <DataSourceItem
              active={router.asPath.includes(`/profile`)}
              icon={<UserCircleIcon className="h-8 w-8 text-gray-700" />}
              link={`/profile`}
              label={sessionIsLoading ? "Loading" : `Your profile ${session?.user?.name}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DataSourcesSidebar);

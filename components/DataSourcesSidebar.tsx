import { DataSource } from "@prisma/client"
import { HomeIcon, PlusIcon } from "@heroicons/react/outline";
import { Tooltip } from "@chakra-ui/react";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
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
}: {
  active?: boolean;
  label: string;
  link: string;
  icon?: ReactNode;
}) => {
  return (
    <Link href={link} passHref>
      <a className="block">
        <Tooltip label={label} placement="right">
          <span
            className={classNames(
              "flex items-center justify-center w-12 h-12 rounded bg-gray-100",
              "hover:bg-blue-gray-200 overflow-hidden overflow-ellipsis w-full",
              "block text-gray-800 font-normal cursor-pointer text-sm py-2 px-4 rounded-md leading-none",
              { "bg-blue-gray-300 hover:bg-gray-300": active }
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

  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();

  return (
    <div className="py-2 px-2">
      {dataSourcesResponse?.ok && (
        <div className="space-y-x w-full">
          {isLoading && <div>loading data sources...</div>}
          {error && <div>Error: {JSON.stringify(error)}</div>}
          {!isLoading && dataSourcesResponse?.ok && (
            <div className="space-y-2">
              <Link href={`/data-sources`} passHref>
                <a className="block">
                  <Tooltip label="Home" placement="right">
                    <span className="flex items-center justify-center space-x-1 text-gray-700 cursor-pointer">
                      <HomeIcon className="h-6 inline-block" />
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
                        name={dataSource.name == dataSource.name.toUpperCase() ? dataSource.name.split('').join(' ') : dataSource.name }
                        maxInitials={3}
                        round={true}
                        size="40"
                        color="transparent"
                        fgColor="rgba(31, 41, 55, var(--tw-text-opacity))"
                      />
                    }
                    link={`/data-sources/${dataSource.id}`}
                    label={dataSource.name}
                  />
                ))}
              <DataSourceItem
                active={router.asPath.includes(`/data-sources/new`)}
                icon={<PlusIcon />}
                link={"/data-sources/new"}
                label="Add new data source"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(DataSourcesSidebar);

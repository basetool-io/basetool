import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper } from "./types";
import { SQLError } from "@/lib/errors";
import { baseUrl } from "@/features/api/urls";
import QueryServiceWrapper from "./QueryServiceWrapper";
import axios from "axios";
import getDataSourceInfo from "./getDataSourceInfo";

export const runQuery = async (
  dataSource: DataSource,
  name: string,
  payload?: Record<string, unknown>
) => {
  return (await runQueries(dataSource, [{ name, payload }]))[0];
};

export const runQueries = async (
  dataSource: DataSource,
  queries: { name: string; payload?: Record<string, unknown> }[]
) => {
  const dataSourceInfo = await getDataSourceInfo(dataSource.type);
  let apiDomain = baseUrl;

  if (process.env.PROXY_SERVER) {
    apiDomain = process.env.PROXY_SERVER;
  }

  const url = `${apiDomain}/api/data-sources/${dataSource.id}/query`;

  let response;

  console.log('dataSourceInfo?.runsInProxy->', apiDomain, process.env.PROXY_SERVER, process.env.USE_PROXY, process.env.USE_PROXY == "1", process.env.USE_PROXY === "1", dataSourceInfo?.runsInProxy)

  if (dataSourceInfo?.runsInProxy && process.env.USE_PROXY === "1") {
    try {
      response = await axios.post(url, {
        secret: process.env.PROXY_SECRET,
        queries,
      });

      return response ? response.data : [];
    } catch (error) {
      const data = error.response.data;
      if (data.error && data.type) {
        let newError;

        if (data.type === "SQLError") {
          newError = new SQLError(data.message);
        } else {
          newError = new Error(data.message);
        }
        newError.stack = data.stack;

        throw newError;
      } else {
        let message = "Something went wrong with the DB connection.";

        // Try to fetch the root message from `ApiResponse`
        if (error?.response?.data?.meta?.errorMessage) {
          message = error?.response?.data?.meta?.errorMessage;
        }

        throw new Error(message);
      }
    }
  } else {
    const service = await getQueryServiceWrapper(dataSource);

    return await service.runQueries(queries);
  }
};

export const getQueryServiceClass = async (type: string) => {
  const dataSourceType = type === "maria_db" ? "mysql" : type;

  return (
    await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
  ).default;
};

export const getQueryServiceWrapper = async (
  dataSource: DataSource
): Promise<IQueryServiceWrapper> => {
  let queryService;

  try {
    queryService = await getQueryServiceClass(dataSource.type);

    return new QueryServiceWrapper(queryService, dataSource);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      // Returning a "null" Query service wrapper
      return {
        runQuery(name, payload) {
          return null;
        },
        runQueries(queries) {
          return null;
        },
      };
    } else {
      throw error;
    }
  }
};

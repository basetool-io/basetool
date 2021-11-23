import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper } from "./types";
import { SQLError } from "@/lib/errors";
import { baseUrl } from "@/features/api/urls";
import GoogleSheetsQueryService from "@/plugins/data-sources/google-sheets/QueryService";
import MSSQLQueryService from "@/plugins/data-sources/mssql/QueryService";
import MySQLQueryService from "@/plugins/data-sources/mysql/QueryService";
import PostgreSQLQueryService from "@/plugins/data-sources/postgresql/QueryService";
import QueryServiceWrapper from "./QueryServiceWrapper";
import axios from "axios";
import getDataSourceInfo from "./getDataSourceInfo";
import logger from "@/lib/logger";
import options from "@/features/options";
import pooler from "./ConnectionPooler"

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
  let url = `${baseUrl}/api`;

  if (process.env.PROXY_SERVER) {
    apiDomain = process.env.PROXY_SERVER;
    url = apiDomain;
  }

  url = `${url}/data-sources/${dataSource.id}/query`;

  let response;
  // We want to better control if the queries should run in a proxy
  // We're checking to see if the redis DB has any options set 1 or 0.
  // If nothing is set in redis, we're going to fallback to an environment variable.
  const runInProxyOverride = (await options.exists("runInProxy"))
    ? (await options.get("runInProxy")) === "1"
    : process.env.USE_PROXY === "1";

  if (dataSourceInfo?.runsInProxy && runInProxyOverride) {
    logger.debug(
      `Running query in proxy on the following API server ${apiDomain}`
    );

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
    logger.debug(`Running query on own server.`);

    const service = await pooler.getConnection(dataSource);

    return await service.runQueries(queries);
  }
};

export const getQueryServiceClass = async (type: string) => {
  switch (type) {
    case "google-sheets":
      return GoogleSheetsQueryService;
    case "maria_db":
    case "mysql":
      return MySQLQueryService;
    case "mssql":
      return MSSQLQueryService;
    default:
    case "postgresql":
      return PostgreSQLQueryService;
  }
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
        async runQuery(name, payload) {
          return null;
        },
        async runQueries(queries) {
          return null;
        },
        async disconnect() {
          return null;
        },
      };
    } else {
      throw error;
    }
  }
};

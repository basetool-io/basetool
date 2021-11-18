import { DataSource } from "@prisma/client";
import { ISQLQueryService } from "./abstract-sql-query-service/types"
import { QueryServiceWrapperPayload } from "./types"
import { SQLError } from "@/lib/errors";
import { baseUrl } from "@/features/api/urls";
import QueryServiceWrapper from "./QueryServiceWrapper"
import axios from "axios";

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
  let apiDomain = baseUrl

  if (process.env.DB_PROXY_SERVER) {
    apiDomain = process.env.DB_PROXY_SERVER;
  }

  const url = `${apiDomain}/api/data-sources/${dataSource.id}/query`;

  let response;

  if (process.env.USE_QUERY_ROUTE === '1') {
    try {
      response = await axios.post(url, {
        secret: process.env.QUERY_SECRET,
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
        throw new Error("Something went wrong with the DB connection.");
      }
    }
  } else {
    const service = await getQueryService(dataSource, payload)

    try {
      return res.send(await service.runQueries(req?.body?.queries));
    } catch (error) {
      return res.status(500).send({
        error: true,
        type: error.constructor.name,
        message: error.message,
        stack: error.stack,
      });
    }
  }
};

export const getQueryServiceClass = async (type: string): Promise<ISQLQueryService> => {
  const dataSourceType = type === "maria_db" ? "mysql" : type;

  return (
    await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
  ).default;
};

export const getQueryService = async (dataSource: DataSource, payload: QueryServiceWrapperPayload) => {
  const queryServiceClass = await getQueryServiceClass(dataSource.type);

  return new QueryServiceWrapper(queryServiceClass, payload);
}

import { DataSource } from "@prisma/client";
import { SQLError } from "@/lib/errors";
import { baseUrl } from "@/features/api/urls";
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
};

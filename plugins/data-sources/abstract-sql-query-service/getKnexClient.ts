import { ClientOverrides, SQLDataSourceTypes } from "./types";
import { MysqlCredentials } from "../mysql/types";
import { PgCredentials } from "../postgresql/types";
import knex from "knex";
import type { Knex } from "knex";

export const getKnexClient = (
  type: "pg" | SQLDataSourceTypes,
  credentials: PgCredentials | MysqlCredentials,
  overrides?: ClientOverrides
) => {
  // Doing this transformation because knex expects `pg` and we have it as `postgresql`
  const knexClientType = type === "postgresql" ? "pg" : type;

  // Initial config
  const connection: Knex.StaticConnectionConfig = {
    host: credentials.host,
    port: credentials.port,
    database: credentials.database,
    user: credentials.user,
    password: credentials.password,
  };

  // Initial if use SSL is checked
  if (credentials.useSsl) {
    connection.ssl = { rejectUnauthorized: false };
  }

  // We might need to override some things when on SSH
  if (overrides) {
    connection.host = overrides.host;
    connection.port = overrides.port;
  }

  // If the type of connection is MSSQL, we need to add the `encrypt` option for azure connections.
  if (type === "mssql" && connection.host && connection.host.includes("database.windows.net")) {
    (connection as Knex.MsSqlConnectionConfig).options = { encrypt: true };
  }

  const client = knex({
    client: knexClientType,
    connection,
    debug: false,
  });

  return client;
};

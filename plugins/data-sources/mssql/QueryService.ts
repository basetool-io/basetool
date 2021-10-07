import { MysqlCredentials } from "../abstract-sql-query-service/types";
import { knex } from "knex";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService";
import type { Knex } from "knex";

class QueryService extends AbstractQueryService {
  public getCredentials() {
    const credentials = this.getParsedCredentials() as MysqlCredentials;

    if (!credentials || !credentials.host)
      throw new Error("No credentials on record.");

    return credentials;
  }

  getClient(): Knex {
    const credentials = this.getCredentials();

    const connection: Knex.StaticConnectionConfig = {
      host: credentials.host,
      port: credentials.port,
      database: credentials.database,
      user: credentials.user,
      password: credentials.password,
    };

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false };
    }

    const client = knex({
      client: "mssql",
      connection,
      debug: false,
    });

    return client;
  }
}

export default QueryService;

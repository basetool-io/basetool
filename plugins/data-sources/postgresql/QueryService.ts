import { PostgresCredentials } from "./types"
import { knex } from "knex";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService"
import type { Knex } from "knex";

class QueryService extends AbstractQueryService {
  public getCredentials() {
    const credentials = this.getParsedCredentials() as PostgresCredentials

    if (!credentials || !credentials.url)
      throw new Error("No credentials on record.");

    return credentials
  }

  getClient(): Knex {
    const credentials = this.getCredentials()

    const connectionString = credentials.url;
    const connection: Knex.StaticConnectionConfig = {
      connectionString,
    };

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false };
    }

    const client = knex({
      client: 'pg',
      connection,
      debug: false,
    });

    return client
  }
}

export default QueryService;

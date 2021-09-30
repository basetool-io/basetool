import { IQueryService, IQueryServiceWrapper } from "./types";

export default class QueryServiceWrapper implements IQueryServiceWrapper {
  public client: IQueryService;

  constructor(client: any, payload: any) {
    this.client = new client(payload) as IQueryService;
  }

  public async runQuery(name: keyof IQueryService, payload?: unknown) {
    await this.client.connect();

    const response = await this.client[name](payload);

    await this.client.disconnect();

    return response;
  }

  public async runQueries(
    queries: { name: keyof IQueryService; payload?: unknown }[]
  ) {
    await this.client.connect();

    const response = await Promise.all(
      queries.map(({ name, payload }) => {
        return this.client[name](payload);
      })
    );

    await this.client.disconnect();

    return response;
  }
}

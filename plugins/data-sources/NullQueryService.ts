import { Column } from "@/features/fields/types"
import { DataSource } from "@prisma/client";
import { IQueryService } from "./types";
import logger from "@/lib/logger";

export default class NullQueryService implements IQueryService {
  dataSource: DataSource | undefined;
  queryResult: unknown;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(payload: any) {
    logger.warn("NullQueryService instantiated.", payload);
  }

  public async connect(): Promise<this> {
    return this;
  }
  public async disconnect(): Promise<this> {
    return this;
  }
  public async getTables(): Promise<[]> {
    return [];
  }
  public async getColumns(
    tableName: string,
    storedColumns?: Column[]
  ): Promise<[]> {
    return [];
  }
  public async getRecords(tableName: string): Promise<[]> {
    return [];
  }
  public async getRecord(
    tableName: string,
    recordId: string
  ): Promise<unknown> {
    return [];
  }
  public async updateRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<unknown> {
    return [];
  }
  public async createRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<number | string> {
    return "";
  }
}

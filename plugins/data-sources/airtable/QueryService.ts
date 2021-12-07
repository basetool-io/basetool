import { AirtableBase } from "airtable/lib/airtable_base";
import { Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IFilter } from "@/features/tables/types";
import { IQueryService, RecordResponse, RecordsResponse } from "../types";
import { decrypt } from "@/lib/crypto";
import { first, isBoolean, isNumber, isObjectLike } from "lodash";
import { getColumnLabel } from "..";
import Airtable from "airtable";

type AirtableValues = string | number | boolean | null;

export interface AirtableDataSource extends DataSource {
  options: {
    secretKey?: string;
    baseId: string;
    tableNames: string;
  };
}

class QueryService implements IQueryService {
  public client: AirtableBase;

  public dataSource: AirtableDataSource;

  constructor({ dataSource }: { dataSource: AirtableDataSource }) {
    if (!dataSource || !dataSource.encryptedCredentials)
      throw new Error("No data source provided.");

    const credentialsAsAString = decrypt(dataSource.encryptedCredentials);

    if (!credentialsAsAString) throw new Error("No credentials on record.");

    let credentials: any | null;

    try {
      credentials = JSON.parse(credentialsAsAString);
    } catch (error) {
      throw new Error("Failed to parse encrypted credentials");
    }

    if (!credentials || !credentials.secretKey)
      throw new Error("No credentials on record.");

    if (!dataSource.options.baseId) throw new Error("No baseId on record.");

    this.dataSource = dataSource;

    this.client = new Airtable({
      apiKey: credentials.secretKey as string,
    }).base(dataSource.options.baseId as string);
  }

  public async connect(): Promise<this> {
    // This client does not need to connect

    return this;
  }

  public async disconnect(): Promise<this> {
    // This client does not need to connect

    return this;
  }

  public async getTables() {
    const tableNames = this.dataSource.options.tableNames
      .split(",")
      .map((name) => name.trim());

    return tableNames.map((name) => ({
      name,
    }));
  }

  public async getColumns(): Promise<[]> {
    return [];
  }

  public async getRecords({
    tableName,
    limit,
    offset,
    filters,
    orderBy,
    orderDirection,
    select,
    startingAfter,
    endingBefore,
  }: {
    tableName: string;
    filters: IFilter[];
    limit?: number;
    offset?: number;
    orderBy: string;
    orderDirection: string;
    select: string[];
    startingAfter?: string;
    endingBefore?: string;
    columns?: Column[];
  }): Promise<RecordsResponse> {
    const tableNames = this.dataSource.options.tableNames
      .split(",")
      .map((name) => name.trim());

    // Checking if the tableName is in the given tableNames
    if (tableNames.includes(tableName)) {
      // casting as any because TS squaks at the `limit` param
      const params: any = {
        limit,
      };
      if (startingAfter) params.starting_after = startingAfter;
      if (endingBefore) params.ending_before = endingBefore;

      const response = await this.client(tableName)
        ?.select({
          // Selecting the first 3 records in Grid view:
          // maxRecords: 2,
          pageSize: 24,
          view: "Grid view",
        })
        .firstPage();

      const recordsResponse = response.map((record) => {
        return { id: record.id, ...record.fields };
      });

      const meta = {
        // hasMore: response.has_more,
      };

      // casting as any[] because Airtable's API returns some weird object
      const records: any[] = recordsResponse || [];

      let columns: Column[] = [];
      if (records && records.length > 0) {
        columns = recordToColumns(first(records));
      }

      return { records, columns, meta };
    }

    return { records: [], columns: [], meta: {} };
  }

  public async getRecordsCount(): Promise<number | undefined> {
    return undefined;
  }

  public async getRecord({
    tableName,
    recordId,
    select,
  }: {
    tableName: string;
    recordId: string;
    select: string[];
  }): Promise<RecordResponse<AirtableValues> | undefined> {
    // Checking if the tableName is in the supported APIs
    const tableNames = this.dataSource.options.tableNames
      .split(",")
      .map((name) => name.trim());

    // Checking if the tableName is in the given tableNames
    if (tableNames.includes(tableName)) {
      const record = await this.client(tableName)?.find("recZMxivcNidwqGW5");
      const recordResponse = { id: record.id, ...record.fields };

      const columns = recordToColumns(recordResponse);

      return { record: recordResponse, columns };
    }

    return { record: undefined, columns: [] };
  }
}

export default QueryService;

const recordToColumns = (record: Record<string, AirtableValues>): Column[] =>
  Object.entries(record).map(([key, value]) => {
    const column = {
      name: key,
      label: getColumnLabel({ name: key }),
      dataSourceInfo: {},
      primaryKey: key === "id",
      baseOptions: {
        visibleOnIndex: true,
        visibleOnShow: true,
        visibleOnEdit: true,
        visibleOnNew: true,
        required: false,
        nullable: false,
        nullValues: [],
        readonly: false,
        placeholder: "",
        help: "",
        label: "",
        disconnected: false,
        defaultValue: "",
        computed: false,
        computedSource: "",
        backgroundColor: "",
      },
      fieldType: getFieldTypeFromColumnInfo(key, value),
      fieldOptions: {},
    };

    return column;
  });

const getFieldTypeFromColumnInfo = (
  key: string,
  value: AirtableValues
): FieldType => {
  if (key === "id") return "Id";

  if (["created", "updated"].includes(key)) return "DateTime";

  if (isNumber(value)) return "Number";
  if (isBoolean(value)) return "Boolean";
  if (isObjectLike(value)) return "Json";

  return "Text";
};

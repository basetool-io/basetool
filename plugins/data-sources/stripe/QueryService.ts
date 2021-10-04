import { DataSource } from "@prisma/client";
import { FieldType } from "@/features/fields/types";
import { IFilter } from "@/features/tables/components/Filter";
import { IQueryService } from "../types";
import { decrypt } from "@/lib/crypto";
import { getColumnLabel } from "..";
import { isBoolean, isNumber, isObjectLike } from "lodash";
import { singular } from "pluralize";
import Stripe from "stripe";
import openApiSpec from "@/plugins/data-sources/stripe/openapi_fixtures3.json";

export interface StripeDataSource extends DataSource {
  options: {
    secretKey?: string;
  };
}

class QueryService implements IQueryService {
  public client: Stripe;

  public dataSource: StripeDataSource;

  constructor({ dataSource }: { dataSource: StripeDataSource }) {
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

    this.dataSource = dataSource;

    this.client = new Stripe(credentials.secretKey as string, {
      apiVersion: "2020-08-27",
    });
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
    return [
      {
        name: "customers",
      },
    ];
  }

  public async getColumns({
    tableName,
    storedColumns,
  }: {
    tableName: string;
    storedColumns?: [];
  }) {
    const resourceName = singular(tableName);
    const specColumns = (openApiSpec?.resources as any)[resourceName] as Record<
      string,
      unknown
    >;

    if (!specColumns) return [];

    const columns = specToColumns(specColumns);

    return columns;
  }

  public async getRecords({
    tableName,
    limit,
    offset,
    filters,
    orderBy,
    orderDirection,
    select,
  }: {
    tableName: string;
    filters: IFilter[];
    limit?: number;
    offset?: number;
    orderBy: string;
    orderDirection: string;
    select: string[];
  }) {
    const records = await this.client.customers.list({
      limit: 10,
    });

    return records?.data || [];
  }

  public async getRecordsCount(payload: any): Promise<number | undefined> {
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
  }) {
    if ("retrieve" in this.client[tableName as keyof Stripe]) {
      return await this.client[tableName as keyof Stripe]?.retrieve(recordId);
    }
  }
}

export default QueryService;

const specToColumns = (specColumns: Record<string, string | number | boolean | null>) => {
  return Object.entries(specColumns).map(([key, value]) => {
    const column = {
      name: key,
      label: getColumnLabel({ name: key }),
      dataSourceInfo: {},
      primaryKey: key === "id",
      baseOptions: {
        visibility: ["index", "show", "edit", "new"],
        required: false,
        nullable: false,
        nullValues: [],
        readonly: false,
        placeholder: "",
        help: "",
        label: "",
        disconnected: false,
        defaultValue: "",
      },
      fieldType: getFieldTypeFromColumnInfo(key, value),
      fieldOptions: {},
    };

    return column;
  });
};

const getFieldTypeFromColumnInfo = (
  key: string,
  value: string | number | boolean | null
): FieldType => {
  if (key === "id") return "Id";

  if (["created", "updated"].includes(key)) return "DateTime";

  if (isNumber(value)) return "Number";
  if (isBoolean(value)) return "Boolean";
  if (isObjectLike(value)) return "Json";

  return "Text";
};

import { Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IFilter } from "@/features/tables/types";
import { IQueryService, RecordResponse, RecordsResponse } from "../types";
import { decrypt } from "@/lib/crypto";
import { first, isBoolean, isNumber, isObjectLike } from "lodash";
import { getColumnLabel } from "..";
import Stripe from "stripe";

type StripeValues = string | number | boolean | null;

enum StripeListAPIs {
  customers = "customers",
  charges = "charges",
  balanceTransactions = "balanceTransactions",
  events = "events",
  files = "files",
  fileLinks = "fileLinks",
  paymentIntents = "paymentIntents",
  payouts = "payouts",
  refunds = "refunds",
  products = "products",
  prices = "prices",
  coupons = "coupons",
  promotionCodes = "promotionCodes",
  taxCodes = "taxCodes",
  taxRates = "taxRates",
  creditNotes = "creditNotes",
  invoices = "invoices",
  invoiceItems = "invoiceItems",
  plans = "plans",
  quotes = "quotes",
  subscriptions = "subscriptions",
  subscriptionSchedules = "subscriptionSchedules",
  accounts = "accounts",
  applicationFees = "applicationFees",
}

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
    return Object.keys(StripeListAPIs).map((name) => ({
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
    tableName: StripeListAPIs;
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
    // Checking if the tableName is in the supported APIs
    if (Object.values(StripeListAPIs).includes(tableName)) {
      // casting as any because TS squaks at the `limit` param
      const params: any = {
        limit,
      };
      if (startingAfter) params.starting_after = startingAfter;
      if (endingBefore) params.ending_before = endingBefore;

      const response = await this.client[tableName]?.list(params);

      const meta = {
        hasMore: response.has_more,
      };
      // casting as any[] because Stripe's API returns some weird object
      const records: any[] = response?.data || [];

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
    tableName: StripeListAPIs;
    recordId: string;
    select: string[];
  }): Promise<RecordResponse<StripeValues> | undefined> {
    // Checking if the tableName is in the supported APIs
    if (Object.values(StripeListAPIs).includes(tableName)) {
      const record = (await this.client[tableName]?.retrieve(
        recordId
      )) as unknown as Record<string, StripeValues>;
      const columns = recordToColumns(record);

      return { record, columns };
    }

    return { record: undefined, columns: [] };
  }
}

export default QueryService;

const recordToColumns = (record: Record<string, StripeValues>): Column[] =>
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
  value: StripeValues
): FieldType => {
  if (key === "id") return "Id";

  if (["created", "updated"].includes(key)) return "DateTime";

  if (isNumber(value)) return "Number";
  if (isBoolean(value)) return "Boolean";
  if (isObjectLike(value)) return "Json";

  return "Text";
};

import { Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IFilter } from "@/features/tables/components/Filter";
import { IQueryService, RecordResponse, RecordsResponse } from "../types";
import { Views } from "@/features/fields/enums";
import { decrypt } from "@/lib/crypto";
import { getColumnLabel } from "..";
import { isBoolean, isNumber, isObjectLike } from "lodash";
import Stripe from "stripe";

type StripeValues = string | number | boolean | null;

// queriableData = {
//   datasourceId: '27',
//   tableName: 'teams',
//   record: {
//     ...rest,
//     team_id: 20,
//   }
//   teams: {
//     team_id: new Team()
//   }
// }
// {{teams.team_id}}
// {{record.team_id.ceva.altceva}}

// {{getRecord(datasourceId, tableName, recordId)}} // "definitia"
// {{getRecord(datasourceID, tableName, record.team_id).name}}

// {{getRecord id=record.team_id}}

// 'balance_transaction'
// 'charge'
// 'customer'
// 'dispute'
// 'event'
// 'file'
// 'file_link'
// 'mandate'
// 'payment_intent'
// 'payload'
// 'product'
// 'refund'
// 'setup_attempt'
// 'setup_intempt'
// 'token'
// 'coupon'
// 'credit_note'
// 'credit_note_line_item'
// 'customer_balance_transaction'
// 'discount'
// 'invoice'
// 'invoice_item'
// 'Invoice_line_item_map'
// 'line_item'
// 'plan'
// 'price'
// 'promotion_code'
// 'subscription'
// 'subscription_item'
// 'Subscription_schedule'
// 'Usage_record'
// 'Usage_record_summary'
// 'Upcoming Invoices'
// 'Upcoming_customer_invoice'
// 'Bank_account'
// 'card'
// 'Payment_method'
// 'Recipient'
// 'Review'
// 'Source'
// 'Account'
// 'Item'
// 'order'
// 'token'
// 'token'
// 'token'
// 'token'
// 'token'

enum StripeEnabledApis {
  customers = "customers",
  charges = "charges",
  balance = "balance",
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
    return Object.keys(StripeEnabledApis).map((name) => ({
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
  }: {
    tableName: string;
    filters: IFilter[];
    limit?: number;
    offset?: number;
    orderBy: string;
    orderDirection: string;
    select: string[];
  }): Promise<RecordsResponse> {
    if (
      "list" in this.client[tableName as keyof Stripe] &&
      (Object.values(StripeEnabledApis) as string[]).includes(tableName)
    ) {
      const records =
        (
          await this.client[tableName as StripeEnabledApis]?.list({
            limit,
          })
        )?.data || [];

      let columns: Column[] = [];
      if (records && records.length > 0) {
        columns = recordToColumns(records[0]);
      }

      return { records, columns };
    }

    return { records: [], columns: [] };
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
  }): Promise<RecordResponse<StripeValues> | undefined> {
    if (
      "retrieve" in this.client[tableName as keyof Stripe] &&
      (Object.values(StripeEnabledApis) as string[]).includes(tableName)
    ) {
      const record = (await this.client[
        tableName as StripeEnabledApis
      ]?.retrieve(recordId)) as unknown as Record<string, StripeValues>;
      const columns = recordToColumns(record);

      return { record, columns };
    }

    return;
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
        visibility: [
          Views["index"],
          Views["show"],
          Views["edit"],
          Views["new"],
        ],
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

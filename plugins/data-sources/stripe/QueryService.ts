import { DataSource } from "@prisma/client";
import { IFilter } from "@/features/tables/components/Filter";
import { IQueryService } from "../types";
import { decrypt } from "@/lib/crypto";
import Stripe from "stripe";

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
    return [
      {
        name: "id",
        label: "ID",
        dataSourceInfo: {
          type: "bigint",
          maxLength: null,
          nullable: false,
          defaultValue: "nextval('projects_users_id_seq'::regclass)",
        },
        primaryKey: true,
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
        fieldType: "Id",
        fieldOptions: {},
      },
      {
        name: "email",
        label: "Email",
        dataSourceInfo: {
          type: "bigint",
          maxLength: null,
          nullable: false,
          defaultValue: "nextval('projects_users_id_seq'::regclass)",
        },
        primaryKey: false,
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
        fieldType: "Text",
        "fieldOptions": {
          "displayAsLink": false,
          "openNewTab": false,
          "linkText": "",
          "displayAsImage": false,
          "displayAsEmail": false
        }
      },
    ];
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
      limit: 10
    });

    return records?.data || [];
  }

  public async getRecordsCount(payload: any): Promise<number | undefined> {
    return undefined
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
    if ('retrieve' in this.client[tableName as keyof Stripe]) {
      return await this.client[tableName as keyof Stripe]?.retrieve(recordId);
    }
  }
}

export default QueryService;

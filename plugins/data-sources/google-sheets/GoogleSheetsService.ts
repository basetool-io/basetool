import { Column } from "@/features/fields/types";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { OAuth2Client } from "google-auth-library";
import { decrypt, encrypt } from "@/lib/crypto";
import { google } from "googleapis";
import { merge } from "lodash"
import pick from "lodash/pick";
import prisma from "@/prisma";

type DataSource = any;
type GoogleSheetsCredentials = any;

const sheets = google.sheets("v4");

class GoogleSheetsService {
  public dataSource: DataSource;

  public oauthClient: OAuth2Client | undefined;

  public doc: GoogleSpreadsheet;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.initOauthClient();
    this.setDoc();
  }

  public async getSheets(sheetId: string): Promise<{ name: string }[]> {
    // Go through the provided sheets and return a commonly object
    const sheets = Object.entries(doc.sheetsByTitle).map(([title, sheet]) => ({
      name: title,
    }));

    return sheets;
  }

  public async getColumns(
    sheetId: string,
    sheetTitle: string,
    storedColumns: []
  ): Promise<Column[]> {
    const sheet = doc.sheetsByTitle[sheetTitle];

    await sheet.loadHeaderRow();

    const convertedHeaders = sheet.headerValues.map((headerName) => ({
      name: headerName,
      label: headerName,
      fieldType: "Text",
      baseOptions: {
        visibility: ["index", "show", "edit", "new"],
        required: false,
        nullable: false,
        readonly: false,
        placeholder: "",
        help: "",
      },
      dataSourceInfo: {},
      fieldOptions: {},
    }))

    convertedHeaders.unshift({
      name: 'id',
      label: 'id',
      fieldType: "Id",
      primaryKey: true,
      baseOptions: {
        visibility: ["index", "show", "edit", "new"],
        required: false,
        nullable: false,
        readonly: false,
        placeholder: "",
        help: "",
      },
      dataSourceInfo: {},
      fieldOptions: {},

    })

    return convertedHeaders;
  }

  public async getRowCount(
    sheetId: string,
    sheetTitle: string
  ): Promise<number> {
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();

    return rows.length;
  }

  public async getRows(sheetId: string, sheetTitle: string): Promise<Record<string, unknown>[]> {
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rawRows = await sheet.getRows();
    // console.log('rows->', rows)
    const rows = rawRows.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          // Convert the rowNumber to an ID
          if (key === '_rowNumber') return ['id', value]

          return [key, value]
        }).filter(([key, value]) => !key.startsWith("_")) // Remove private fields off the object
      );
    });

    return rows;
  }

  // OLD 👇

  public async getSpreadsheet(sheetId: string) {
    // return 123
    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(sheetId);

    doc.useOAuth2Client(this.oauthClient);

    // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    // await doc.useServiceAccountAuth({
    //   client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //   private_key: process.env.GOOGLE_PRIVATE_KEY,
    // });

    console.log(222, sheetId);
    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);
    // await doc.updateProperties({ title: 'renamed doc' });
    // return doc.sheetsByIndex

    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    console.log(sheet.title);
    console.log(sheet.rowCount);
    await sheet.loadHeaderRow();
    console.log(sheet.headerValues);

    // console.log(await sheet.getRows());

    return doc.title;
  }

  public async loadInfo() {
    if (!this.doc) return this;

    await this.doc.loadInfo();

    return this;
  }

  public getInfo() {
    return pick(this.doc, [
      "title",
      "spreadsheetId",
      "locale",
      "timeZone",
      "autoRecalc",
      "defaultFormat",
      "spreadsheetTheme",
      "iterativeCalculationSettings",
    ]);
  }

  public async listSpreadsheets() {
    const drive = google.drive({
      version: "v3",
      auth: this.oauthClient,
    });
    const files = await drive.files.list({
      pageSize: 1000,
      q: "mimeType: 'application/vnd.google-apps.spreadsheet'",
    });

    return files?.data ? files.data : {};
  }

  public get sheetsById() {
    return this.doc.sheetsById;
  }

  public get sheetsByTitle() {
    return this.doc.sheetsByTitle;
  }

  private initOauthClient() {
    // Initialize the OAuth2Client with your app's oauth credentials
    const oauthClient = new OAuth2Client({
      clientId: process.env.GSHEETS_CLIENT_ID,
      clientSecret: process.env.GSHEETS_CLIENT_SECRET,
    });

    const credentialsAsAString = decrypt(this.dataSource.encryptedCredentials);

    if (!credentialsAsAString) throw new Error("No credentials on record.");

    let credentials: GoogleSheetsCredentials | null;

    try {
      credentials = JSON.parse(credentialsAsAString);
    } catch (error) {
      throw new Error("Failed to parse encrypted credentials.");
    }

    const { tokens } = credentials;
    if (!credentials || !tokens) throw new Error("No credentials on record.");

    oauthClient.credentials.access_token = tokens.access_token;
    oauthClient.credentials.refresh_token = tokens.refresh_token;
    oauthClient.credentials.expiry_date = tokens.expiry_date;

    this.oauthClient = oauthClient;

    this.oauthClient.on("tokens", async (newTokens) => {
      const mergedTokens = merge(tokens, newTokens)
      const encryptedCredentials = encrypt(JSON.stringify({ tokens: mergedTokens }));

      await prisma.dataSource.update({
        where: {
          id: this.dataSource.id,
        },
        data: {
          encryptedCredentials,
        },
      });
    });

    return this;
  }

  private setDoc() {
    if (!this.oauthClient) return this;

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(
      "1-yUnxCbRnOb4F64Ep4lOovh6U3VRyNPnhVJUPNi3WUE"
    );
    doc.useOAuth2Client(this.oauthClient);

    this.doc = doc;

    return this;
  }
}

export default GoogleSheetsService;

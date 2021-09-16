import { DataSource } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { initOauthClient, refreshTokens } from "./QueryService";

class GoogleDriveService {
  public dataSource: DataSource;

  public oauthClient: OAuth2Client;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;

    const oauthClient = initOauthClient(dataSource);
    if (!oauthClient) throw new Error("Failed to initialize OAuth client");

    this.oauthClient = oauthClient;
  }

  public async listSpreadsheets() {
    const drive = google.drive({
      version: "v3",
      auth: this.oauthClient,
    });

    let files;

    try {
      files = await drive.files.list({
        pageSize: 1000,
        q: "mimeType: 'application/vnd.google-apps.spreadsheet'",
      });
    } catch (error: any) {
      if (error.message.includes("Invalid Credentials")) {
        throw new Error(
          "Invalid Credentials. Please remove and re-add this data source."
        );
      }

      if (
        error.message.includes(
          "No refresh token or refresh handler callback is set"
        )
      ) {
        // Refreshing the tokens
        await refreshTokens(this.dataSource, this.oauthClient);

        // Getting new oauth client that reflects the new tokens
        const newOauthClient = initOauthClient(this.dataSource);
        if (!newOauthClient)
          throw new Error("Failed to initialize OAuth client");

        this.oauthClient = newOauthClient;

        // Fetching the files again
        files = await drive.files.list({
          pageSize: 1000,
          q: "mimeType: 'application/vnd.google-apps.spreadsheet'",
        });
      }
    }

    return files?.data ? files.data : {};
  }
}
export default GoogleDriveService;

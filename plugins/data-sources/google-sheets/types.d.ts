import { DataSource } from '@prisma/client'

export type GoogleSheetsDataSourceOptions = {
  spreadsheetId: string | null
}

export type GoogleSheetsCredentials = {
  tokens: {
    refresh_token: string,
    access_token: string,
    scope: string,
    token_type: 'Bearer',
    expiry_date: number
  }
};

export interface GoogleSheetsDataSource extends DataSource implements DataSource {
  options: GoogleSheetsDataSourceOptions
  encryptedCredentials: string
}

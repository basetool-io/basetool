import { GoogleSpreadsheet } from 'google-spreadsheet'
import { OAuth2Client } from 'google-auth-library'
import DataSource from '@/types/app-state/DataSource'
import pick from 'lodash/pick'

import { google } from 'googleapis'

const sheets = google.sheets('v4')

class GoogleSheetsService {
  public dataSource: DataSource

  public oauthClient: OAuth2Client

  public doc: GoogleSpreadsheet

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource
    this.initOauthClient()
    this.setDoc()
  }

  public async loadInfo() {
    if (!this.doc) return this

    await this.doc.loadInfo()

    return this
  }

  public getInfo() {
    return pick(this.doc, ['title', 'spreadsheetId', 'locale', 'timeZone', 'autoRecalc', 'defaultFormat', 'spreadsheetTheme', 'iterativeCalculationSettings'])
  }

  public async listSpreadsheets() {
    const drive = google.drive({
      version: 'v3',
      auth: this.oauthClient,
    })
    const files = await drive.files.list({
      pageSize: 1000,
      q: "mimeType: 'application/vnd.google-apps.spreadsheet'",
    })

    return files?.data ? files.data : {}
  }

  public get sheetsById() {
    return this.doc.sheetsById
  }

  public get sheetsByTitle() {
    return this.doc.sheetsByTitle
  }

  private initOauthClient() {
    // Initialize the OAuth2Client with your app's oauth credentials
    const oauthClient = new OAuth2Client({
      clientId: process.env.GSHEETS_CLIENT_ID,
      clientSecret: process.env.GSHEETS_CLIENT_SECRET,
    })

    const { tokens } = this.dataSource.options
    console.log('tokens->', tokens)
    oauthClient.credentials.access_token = tokens.access_token
    oauthClient.credentials.refresh_token = tokens.refresh_token
    oauthClient.credentials.expiry_date = tokens.expiry_date

    oauthClient.on('tokens', (credentials) => {
      console.log('tokens triggered')
      console.log(credentials.access_token)
      console.log(credentials.scope)
      console.log(credentials.expiry_date)
      console.log(credentials.token_type) // will always be 'Bearer'
    })

    this.oauthClient = oauthClient

    return this
  }

  private setDoc() {
    if (!this.oauthClient) return this

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet('1-yUnxCbRnOb4F64Ep4lOovh6U3VRyNPnhVJUPNi3WUE')
    doc.useOAuth2Client(this.oauthClient)

    this.doc = doc

    return this
  }
}

export default GoogleSheetsService

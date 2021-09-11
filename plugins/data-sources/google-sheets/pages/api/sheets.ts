/* eslint-disable no-underscore-dangle */
import { NextApiRequest, NextApiResponse } from 'next'
import { getModelsFromRequest } from '@/pages/api/apps/[id]/data-queries/[dataQueryId]/run'
import { withSentry } from '@sentry/nextjs'
import ApiResponse from '@/src/services/ApiResponse'
import GoogleSheetsService from '../../GoogleSheetsService'

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const [dataQuery, dataSource] = await getModelsFromRequest(req)

  res.send(['yep', req.body])

  // return
  // if (dataSource) {
  //   const api = new GoogleSheetsService(dataSource)

  //   // await api.loadInfo()
  //   // console.log('api.sheetsByTitle->', api.sheetsByTitle)
  //   // const sheets = Object.entries(api.sheetsByTitle).map(([title, spreadsheet]) => ({
  //   //   id: spreadsheet.title,
  //   //   title,
  //   // }))
  //   console.log('hey->')

  //   let driveResponse

  //   try {
  //     driveResponse = (await api.listSpreadsheets())
  //   } catch (error) {
  //     return res.send(ApiResponse.withError(error.message))
  //   }

  //   if (driveResponse?.files) {
  //     const files = driveResponse.files.map(({ id, name }) => ({ id, name }))

  //     res.send(ApiResponse.withData(files))
  //   } else {
  //     res.send([])
  //   }
  // } else {
  //   res.status(404).send('')
  // }
}

export default withSentry(handle)

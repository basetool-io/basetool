// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ApiResponse from '@/features/api/ApiResponse'
import GoogleSheetsService from '@/plugins/data-sources/google-sheets/GoogleSheetsService'
import prisma from '@/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: 2
    }
  })

  // return res.send(dataSource)

  if (dataSource) {
    const api = new GoogleSheetsService(dataSource)

    // await api.loadInfo()
    // console.log('api.sheetsByTitle->', api.sheetsByTitle)
    // const sheets = Object.entries(api.sheetsByTitle).map(([title, spreadsheet]) => ({
    //   id: spreadsheet.title,
    //   title,
    // }))
    console.log('hey->', api)
    // return res.send(api)

    let driveResponse

    try {
      driveResponse = (await api.listSpreadsheets())
    } catch (error: any) {
      return res.send(ApiResponse.withError(error.message))
    }

    if (driveResponse?.files) {
      const files = driveResponse.files.map(({ id, name }) => ({ id, name }))

      res.send(ApiResponse.withData(files))
    } else {
      res.send([])
    }
  } else {
    res.status(404).send('')
  }
  res.status(200).json({ name: 'John Doe' })
}

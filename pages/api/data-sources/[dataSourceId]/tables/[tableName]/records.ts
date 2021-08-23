import { PostgresDataSource } from '@/src/data-sources/postgresql/types'
import { PrismaClient } from '@prisma/client'
import { get, isEmpty } from 'lodash'
import { getDataSourceFromRequest } from '@/src/utils/ApiUtils'
import { withSentry } from '@sentry/nextjs'
import ApiResponse from '@/src/services/ApiResponse'
import IsSignedIn from '@/pages/api/middleware/IsSignedIn'
import OwnsDataSource from '@/pages/api/middleware/OwnsDataSource'
import isNull from 'lodash/isNull'
import type { NextApiRequest, NextApiResponse } from 'next'

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res)
    case 'POST':
      return handlePOST(req, res)
    default:
      return res.status(404).send('')
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (dataSource?.options?.url) {
    const prs = new PrismaClient({
      datasources: { db: { url: dataSource.options.url } },
    })
    const query = `SELECT * FROM ${req.query.tableName}`
    const data = await prs.$queryRaw(query)
    await prs.$disconnect()
    res.json(ApiResponse.withData(data))
  } else {
    res.status(404).send('')
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (dataSource?.options?.url) {
    const client = new PrismaClient({ datasources: { db: { url: dataSource.options.url } }, log: ['query', 'info', 'warn', 'error'] })

    const columns: string[] = []
    const values: any[] = []
    // @todo: fetch this value in a dynamic way
    const primaryKey = 'id'

    const { record } = req.body
    Object.entries(record).forEach(([name, value]) => {
      columns.push(name)
      values.push(isNull(value) ? 'NULL' : `'${value}'`)
    })
    const query = `INSERT INTO ${req.query.tableName} (${columns.join(',')}) VALUES (${values.join(',')}) RETURNING ${primaryKey};`

    let data
    let response
    try {
      data = await client.$queryRaw(query)
    } catch (error) {
      await client.$disconnect()
      if (get(error, ['meta', 'message'])) {
        return res.send(ApiResponse.withError(get(error, ['meta', 'message'])))
      }

      return res.send(ApiResponse.withError(error))
    }

    if (data && !isEmpty(data)) {
      [response] = data
    }

    await client.$disconnect()
    res.json(ApiResponse.withData(response, { message: 'Record added' }))
  } else {
    res.status(404).send('')
  }
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)))

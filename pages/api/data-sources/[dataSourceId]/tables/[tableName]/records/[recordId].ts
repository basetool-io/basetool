import { PostgresDataSource } from '@/src/data-sources/postgresql/types'
import { PrismaClient } from '@prisma/client'
import { first } from 'lodash'
import { getDataSourceFromRequest } from '@/src/utils/ApiUtils'
import { idColumns } from '@/components/fields'
import { withSentry } from '@sentry/nextjs'
import ApiResponse from '@/src/services/ApiResponse'
import IsSignedIn from '@/pages/api/middleware/IsSignedIn'
import OwnsDataSource from '@/pages/api/middleware/OwnsDataSource'
import type { NextApiRequest, NextApiResponse } from 'next'

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res)
    case 'PUT':
      return handlePUT(req, res)
    default:
      return res.status(404).send('')
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (dataSource && dataSource?.options?.url) {
    const prs = new PrismaClient({
      datasources: { db: { url: dataSource.options.url } },
    })
    const query = `SELECT * FROM ${req.query.tableName} where id = ${req.query.recordId}`
    const data = await prs.$queryRaw(query)
    await prs.$disconnect()
    res.json(ApiResponse.withData(first(data)))
  } else {
    res.status(404).send('')
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.changes || Object.keys(req.body.changes).length === 0) return res.send(ApiResponse.withError('No changes sent.'))

  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (dataSource && dataSource?.options?.url) {
    const prs = new PrismaClient({
      datasources: { db: { url: dataSource?.options?.url } },
    })

    const set = Object.entries(req.body.changes)
      .filter(([column]) => !idColumns.includes(column))
      .map(([column, value]) => `${column} = '${value}'`).join(',')

    const query = `UPDATE ${req.query.tableName} SET ${set} WHERE id = ${req.query.recordId}`
    const data = await prs.$queryRaw(query)
    await prs.$disconnect()
    res.json(ApiResponse.withData(data, { message: 'Updated' }))
  } else {
    res.status(404).send('')
  }
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)))

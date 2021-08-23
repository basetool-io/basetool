import { PostgresDataSource } from '@/src/data-sources/postgresql/types'
import { getDataSourceFromRequest } from '@/src/utils/ApiUtils'
import { withSentry } from '@sentry/nextjs'
import ApiResponse from '@/src/services/ApiResponse'
import IsSignedIn from '@/pages/api/middleware/IsSignedIn'
import OwnsDataSource from '@/pages/api/middleware/OwnsDataSource'
import prisma from '@/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  switch (req.method) {
    case 'PUT':
      return handlePUT(req, res)
    default:
      return res.status(404).send('')
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (!req.body.columns) return res.send(ApiResponse.withError('No columns sent.'))

  if (dataSource && dataSource?.options?.url) {
    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: {
          ...dataSource.options,
          columns: req.body.columns,
        },
      },
    })

    return res.json(ApiResponse.withData(result, { message: 'Updated' }))
  }

  res.status(404).send('')
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)))

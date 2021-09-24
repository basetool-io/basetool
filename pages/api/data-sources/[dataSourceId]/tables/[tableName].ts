import { DataSource } from '@prisma/client'
import { getDataSourceFromRequest } from '@/features/api'
import { withMiddlewares } from '@/features/api/middleware'
import ApiResponse from '@/features/api/ApiResponse'
import IsSignedIn from '@/features/api/middlewares/IsSignedIn'
import OwnsDataSource from '@/features/api/middlewares/OwnsDataSource'
import prisma from '@/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
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
  const dataSource = await getDataSourceFromRequest(req) as DataSource | null

  if (!req.body.columns) return res.send(ApiResponse.withError('No columns sent.'))

  if (dataSource && dataSource?.options) {
    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: {
          ...dataSource.options as Record<string, unknown>,
          columns: req.body.columns,
        },
      },
    })

    return res.json(ApiResponse.withData(result, { message: 'Updated' }))
  }

  res.status(404).send('')
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

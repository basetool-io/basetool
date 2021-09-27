import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { PostgresqlDataSource } from "@/plugins/data-sources/postgresql/types";
import { get, merge } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");
  const tableName = req.query.tableName as string;

  const columns = await getColumns({ dataSource, tableName });

  res.json(ApiResponse.withData(columns));
}

export const getColumns = async ({
  dataSource,
  tableName,
}: {
  dataSource: DataSource;
  tableName: string;
}): Promise<Column[]> => {
  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName as string,
    "columns",
  ]);

  const service = await getQueryService({
    dataSource,
    options: { cache: false },
  });

  const columns = await service.runQuery("getColumns", {
    tableName: tableName as string,
    storedColumns,
  });

  return columns;
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = (await getDataSourceFromRequest(
    req
  )) as PostgresqlDataSource | null;

  if (!req.body.changes)
    return res.send(ApiResponse.withError("No changes sent."));

  if (dataSource && req?.query?.tableName) {
    const tableOptions = get(dataSource, [
      "options",
      "tables",
      req.query.tableName as string,
    ]);

    const tableColumnOptions = tableOptions?.columns;

    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: {
          ...dataSource.options,
          tables: {
            ...dataSource.options.tables,
            [req.query.tableName as string]: {
              ...tableOptions,
              columns: merge(tableColumnOptions, req.body.changes),
            },
          },
        },
      },
    });

    return res.json(ApiResponse.withData(result, { message: "Updated" }));
  }

  res.status(404).send("");
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

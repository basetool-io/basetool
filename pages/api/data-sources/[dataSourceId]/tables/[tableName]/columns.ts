import { PostgresqlDataSource } from "@/plugins/data-sources/postgresql/types";
import { get, merge } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import HandlesErrors from "@/features/api/middlewares/HandlesErrors"
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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

  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    req.query.tableName as string,
    "columns",
  ]);

  const service = await getQueryService({ dataSource, options: { cache: false } });

  await service.connect();

  const columns = await service.getColumns(
    req.query.tableName as string,
    storedColumns
  );

  await service.disconnect();

  res.json(ApiResponse.withData(columns));
}

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
      "columns",
    ]);
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
              columns: merge(tableOptions, req.body.changes),
            },
          },
        },
      },
    });

    return res.json(ApiResponse.withData(result, { message: "Updated" }));
  }

  res.status(404).send("");
}

export default withSentry(HandlesErrors(IsSignedIn(OwnsDataSource(handle))));

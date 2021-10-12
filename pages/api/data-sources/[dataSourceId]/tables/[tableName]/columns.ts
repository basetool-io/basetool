import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { get, isUndefined } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
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

  // Sort the columns by their orderIndex if columns has more than 1 element. If orderIndex has not been set, set it to 9999.
  if(columns.length > 1) columns.sort((a: Column, b: Column) => {
    if (isUndefined(a.baseOptions.orderIndex)) a.baseOptions.orderIndex = 9999;
    if (isUndefined(b.baseOptions.orderIndex)) b.baseOptions.orderIndex = 9999;

    return a.baseOptions.orderIndex > b.baseOptions.orderIndex ? 1 : (b.baseOptions.orderIndex > a.baseOptions.orderIndex ? -1 : 0);
  });

  return columns;
};

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

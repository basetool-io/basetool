import { get } from "lodash";
import { getColumns } from "@/features/fields/getColumns";
import { getDataSourceFromRequest, getViewFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import prisma from "@/prisma";
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

const columnsForTable = async (req: NextApiRequest, res: NextApiResponse) => {
  const dataSource = await getDataSourceFromRequest(req);
  const tableName = req.query.tableName as string;

  if (!dataSource || !tableName) return res.status(404).send("");

  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName as string,
    "columns",
  ]);

  const columns = await getColumns({ dataSource, tableName, storedColumns });

  res.json(ApiResponse.withData(columns));
};

const columnsForView = async (req: NextApiRequest, res: NextApiResponse) => {
  const view = await getViewFromRequest(req);
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: view?.dataSourceId,
    },
  });
  const tableName = view?.tableName;

  if (!view || !dataSource || !tableName) return res.status(404).send("");

  // If the data source has columns stored, send those in.
  const storedColumns = view.columns as [] || [];

  const columns = await getColumns({ dataSource, tableName, storedColumns });

  res.json(ApiResponse.withData(columns));
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.viewId) {
    return columnsForView(req, res);
  } else if (req.query.tableName) {
    return columnsForTable(req, res);
  } else {
    return res.status(404).send("");
  }
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
